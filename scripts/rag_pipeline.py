#!/usr/bin/env python3
"""
ARGO Oceanographic Data RAG Pipeline

A comprehensive backend RAG system that:
1. Accepts natural language queries
2. Uses MCP Client to call MCP Server
3. Determines intent (SQL vs semantic retrieval)
4. Executes appropriate retrieval strategy
5. Merges results into structured JSON
6. Generates natural language responses using LLM
"""

import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
import re

# MCP and AI SDK imports
try:
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client
    from openai import OpenAI
    import numpy as np
except ImportError as e:
    print(f"Missing required dependencies: {e}")
    print("Install with: pip install mcp openai numpy")
    exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryIntent(Enum):
    """Query intent classification"""
    SQL_QUERY = "sql"
    SEMANTIC_SEARCH = "semantic"
    HYBRID = "hybrid"
    UNKNOWN = "unknown"

@dataclass
class QueryContext:
    """Context information for query processing"""
    original_query: str
    intent: QueryIntent
    confidence: float
    extracted_entities: Dict[str, Any]
    sql_query: Optional[str] = None
    semantic_query: Optional[str] = None

@dataclass
class ARGOResult:
    """Structured ARGO profile result"""
    id: str
    float_id: str
    cycle_number: int
    location: Dict[str, float]
    timestamp: str
    variables: Dict[str, Any]
    metadata: Dict[str, Any]
    similarity_score: Optional[float] = None
    rag_context: Optional[str] = None

@dataclass
class RAGResponse:
    """Final RAG pipeline response"""
    query: str
    intent: QueryIntent
    results: List[ARGOResult]
    merged_data: Dict[str, Any]
    natural_language_response: str
    metadata: Dict[str, Any]

class IntentClassifier:
    """Classifies user queries into SQL or semantic search intents"""
    
    def __init__(self, openai_client: OpenAI):
        self.openai = openai_client
        
        # SQL intent patterns
        self.sql_patterns = [
            r'\b(select|where|group by|order by|count|sum|avg|max|min)\b',
            r'\b(temperature|salinity|pressure|depth)\s*(>|<|=|>=|<=)\s*\d+',
            r'\b(latitude|longitude)\s*(between|>|<|=)\s*[-\d.]+',
            r'\bdate\s*(between|>|<|=)\s*[\'\"]\d{4}-\d{2}-\d{2}',
            r'\b(profiles?|floats?|cycles?)\s*(with|having|where)',
        ]
        
        # Semantic search patterns
        self.semantic_patterns = [
            r'\b(find|search|show|get|retrieve)\s+.*\b(like|similar|related)',
            r'\b(warm|cold|hot|cool)\s+(water|ocean|sea)',
            r'\b(high|low|deep|shallow)\s+(salinity|temperature|pressure)',
            r'\b(tropical|arctic|polar|equatorial|subtropical)',
            r'\b(upwelling|downwelling|current|gyre|front)',
            r'\b(seasonal|winter|summer|spring|fall|autumn)',
        ]

    async def classify_intent(self, query: str) -> QueryContext:
        """Classify query intent using pattern matching and LLM"""
        
        # Pattern-based classification
        sql_score = sum(1 for pattern in self.sql_patterns 
                       if re.search(pattern, query.lower()))
        semantic_score = sum(1 for pattern in self.semantic_patterns 
                           if re.search(pattern, query.lower()))
        
        # Extract entities
        entities = await self._extract_entities(query)
        
        # LLM-based classification for ambiguous cases
        if abs(sql_score - semantic_score) <= 1:
            intent, confidence = await self._llm_classify(query)
        else:
            if sql_score > semantic_score:
                intent, confidence = QueryIntent.SQL_QUERY, 0.8
            else:
                intent, confidence = QueryIntent.SEMANTIC_SEARCH, 0.8
        
        return QueryContext(
            original_query=query,
            intent=intent,
            confidence=confidence,
            extracted_entities=entities
        )

    async def _extract_entities(self, query: str) -> Dict[str, Any]:
        """Extract relevant entities from query"""
        entities = {}
        
        # Extract numeric values
        numbers = re.findall(r'-?\d+\.?\d*', query)
        if numbers:
            entities['numbers'] = [float(n) for n in numbers]
        
        # Extract dates
        dates = re.findall(r'\d{4}-\d{2}-\d{2}', query)
        if dates:
            entities['dates'] = dates
        
        # Extract oceanographic terms
        ocean_terms = ['temperature', 'salinity', 'pressure', 'depth', 
                      'latitude', 'longitude', 'pacific', 'atlantic', 'indian']
        found_terms = [term for term in ocean_terms if term in query.lower()]
        if found_terms:
            entities['ocean_terms'] = found_terms
        
        return entities

    async def _llm_classify(self, query: str) -> tuple[QueryIntent, float]:
        """Use LLM for intent classification"""
        try:
            response = await self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert in oceanographic data queries. 
                        Classify the user's query as either:
                        - 'sql': Requires structured database queries with specific conditions
                        - 'semantic': Requires natural language understanding and similarity search
                        - 'hybrid': Requires both approaches
                        
                        Respond with JSON: {"intent": "sql|semantic|hybrid", "confidence": 0.0-1.0}"""
                    },
                    {
                        "role": "user", 
                        "content": f"Classify this oceanographic query: '{query}'"
                    }
                ],
                temperature=0.1
            )
            
            result = json.loads(response.choices[0].message.content)
            intent_str = result.get('intent', 'unknown')
            confidence = result.get('confidence', 0.5)
            
            intent_map = {
                'sql': QueryIntent.SQL_QUERY,
                'semantic': QueryIntent.SEMANTIC_SEARCH,
                'hybrid': QueryIntent.HYBRID
            }
            
            return intent_map.get(intent_str, QueryIntent.UNKNOWN), confidence
            
        except Exception as e:
            logger.error(f"LLM classification failed: {e}")
            return QueryIntent.SEMANTIC_SEARCH, 0.5

class SQLQueryGenerator:
    """Generates SQL queries from natural language"""
    
    def __init__(self, openai_client: OpenAI):
        self.openai = openai_client

    async def generate_sql(self, query: str, context: QueryContext) -> str:
        """Generate SQL query from natural language"""
        
        schema_info = """
        ARGO Profiles Table Schema:
        - id: string (primary key)
        - platform_number: string (float identifier)
        - cycle_number: integer
        - latitude: float (-90 to 90)
        - longitude: float (-180 to 180)
        - date: timestamp
        - thermocline_depth: float (meters)
        - salinity_min_depth: float (meters)
        - salinity_max_depth: float (meters)
        - mean_stratification: float
        - surface_temp: float (Celsius)
        - surface_sal: float (PSU)
        - quality_flag: string
        - data_mode: string
        """
        
        try:
            response = await self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": f"""You are an expert SQL query generator for oceanographic ARGO data.
                        
                        {schema_info}
                        
                        Generate efficient PostgreSQL queries. Use proper spatial functions for geographic queries.
                        Always include reasonable LIMIT clauses. Return only the SQL query, no explanations."""
                    },
                    {
                        "role": "user",
                        "content": f"Generate SQL for: '{query}'\n\nExtracted entities: {context.extracted_entities}"
                    }
                ],
                temperature=0.1
            )
            
            sql_query = response.choices[0].message.content.strip()
            
            # Clean up the SQL query
            sql_query = re.sub(r'^```sql\s*', '', sql_query)
            sql_query = re.sub(r'\s*```$', '', sql_query)
            
            return sql_query
            
        except Exception as e:
            logger.error(f"SQL generation failed: {e}")
            # Fallback to basic query
            return "SELECT * FROM argo_profiles ORDER BY date DESC LIMIT 10"

class MCPClient:
    """MCP Client for communicating with ARGO MCP Server"""
    
    def __init__(self, server_path: str = "node server/mcp/index.js"):
        self.server_path = server_path
        self.session: Optional[ClientSession] = None

    async def connect(self):
        """Connect to MCP server"""
        try:
            server_params = StdioServerParameters(
                command=self.server_path.split(),
                env=None
            )
            
            self.session = await stdio_client(server_params)
            logger.info("Connected to MCP server")
            
        except Exception as e:
            logger.error(f"Failed to connect to MCP server: {e}")
            raise

    async def disconnect(self):
        """Disconnect from MCP server"""
        if self.session:
            await self.session.close()
            self.session = None

    async def query_argo_sql(self, sql: str, page: int = 1, page_size: int = 100) -> Dict[str, Any]:
        """Execute SQL query via MCP"""
        if not self.session:
            raise RuntimeError("MCP client not connected")
        
        try:
            result = await self.session.call_tool(
                "queryARGO",
                {
                    "sql": sql,
                    "page": page,
                    "pageSize": page_size
                }
            )
            
            return result.content[0].text if result.content else {}
            
        except Exception as e:
            logger.error(f"SQL query via MCP failed: {e}")
            raise

    async def retrieve_argo_semantic(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Perform semantic search via MCP"""
        if not self.session:
            raise RuntimeError("MCP client not connected")
        
        try:
            result = await self.session.call_tool(
                "retrieveARGO",
                {
                    "query": query,
                    "limit": limit
                }
            )
            
            return result.content[0].text if result.content else {}
            
        except Exception as e:
            logger.error(f"Semantic search via MCP failed: {e}")
            raise

class RAGPipeline:
    """Main RAG Pipeline orchestrator"""
    
    def __init__(self, openai_api_key: str, mcp_server_path: str = "node server/mcp/index.js"):
        self.openai = OpenAI(api_key=openai_api_key)
        self.intent_classifier = IntentClassifier(self.openai)
        self.sql_generator = SQLQueryGenerator(self.openai)
        self.mcp_client = MCPClient(mcp_server_path)

    async def initialize(self):
        """Initialize the RAG pipeline"""
        await self.mcp_client.connect()
        logger.info("RAG Pipeline initialized")

    async def shutdown(self):
        """Shutdown the RAG pipeline"""
        await self.mcp_client.disconnect()
        logger.info("RAG Pipeline shutdown")

    async def process_query(self, query: str) -> RAGResponse:
        """Process a natural language query through the RAG pipeline"""
        start_time = datetime.now()
        
        try:
            # Step 1: Classify intent
            logger.info(f"Processing query: {query}")
            context = await self.intent_classifier.classify_intent(query)
            logger.info(f"Classified intent: {context.intent.value} (confidence: {context.confidence:.2f})")
            
            # Step 2: Execute retrieval strategy
            if context.intent == QueryIntent.SQL_QUERY:
                results = await self._execute_sql_mode(query, context)
            elif context.intent == QueryIntent.SEMANTIC_SEARCH:
                results = await self._execute_semantic_mode(query, context)
            elif context.intent == QueryIntent.HYBRID:
                results = await self._execute_hybrid_mode(query, context)
            else:
                # Default to semantic search
                results = await self._execute_semantic_mode(query, context)
            
            # Step 3: Merge results into structured format
            merged_data = self._merge_results(results, context)
            
            # Step 4: Generate natural language response
            nl_response = await self._generate_response(query, merged_data, context)
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return RAGResponse(
                query=query,
                intent=context.intent,
                results=results,
                merged_data=merged_data,
                natural_language_response=nl_response,
                metadata={
                    "execution_time": execution_time,
                    "timestamp": datetime.now().isoformat(),
                    "confidence": context.confidence,
                    "result_count": len(results)
                }
            )
            
        except Exception as e:
            logger.error(f"Query processing failed: {e}")
            raise

    async def _execute_sql_mode(self, query: str, context: QueryContext) -> List[ARGOResult]:
        """Execute SQL-based retrieval"""
        logger.info("Executing SQL mode")
        
        # Generate SQL query
        sql_query = await self.sql_generator.generate_sql(query, context)
        context.sql_query = sql_query
        logger.info(f"Generated SQL: {sql_query}")
        
        # Execute via MCP
        raw_results = await self.mcp_client.query_argo_sql(sql_query)
        
        # Convert to structured format
        return self._convert_sql_results(raw_results)

    async def _execute_semantic_mode(self, query: str, context: QueryContext) -> List[ARGOResult]:
        """Execute semantic search retrieval"""
        logger.info("Executing semantic mode")
        
        context.semantic_query = query
        
        # Execute semantic search via MCP
        raw_results = await self.mcp_client.retrieve_argo_semantic(query)
        
        # Convert to structured format
        return self._convert_semantic_results(raw_results)

    async def _execute_hybrid_mode(self, query: str, context: QueryContext) -> List[ARGOResult]:
        """Execute hybrid SQL + semantic retrieval"""
        logger.info("Executing hybrid mode")
        
        # Execute both strategies
        sql_results = await self._execute_sql_mode(query, context)
        semantic_results = await self._execute_semantic_mode(query, context)
        
        # Merge and deduplicate results
        combined_results = {}
        
        # Add SQL results
        for result in sql_results:
            combined_results[result.id] = result
        
        # Add semantic results, preserving similarity scores
        for result in semantic_results:
            if result.id in combined_results:
                # Update with similarity score
                combined_results[result.id].similarity_score = result.similarity_score
                combined_results[result.id].rag_context = result.rag_context
            else:
                combined_results[result.id] = result
        
        return list(combined_results.values())

    def _convert_sql_results(self, raw_results: Dict[str, Any]) -> List[ARGOResult]:
        """Convert SQL results to structured format"""
        results = []
        
        try:
            data = json.loads(raw_results) if isinstance(raw_results, str) else raw_results
            profiles = data.get('data', {}).get('data', [])
            
            for profile in profiles:
                result = ARGOResult(
                    id=profile.get('id', ''),
                    float_id=profile.get('platform_number', ''),
                    cycle_number=profile.get('cycle_number', 0),
                    location={
                        'latitude': profile.get('latitude', 0.0),
                        'longitude': profile.get('longitude', 0.0)
                    },
                    timestamp=profile.get('date', ''),
                    variables={
                        'temperature': {
                            'surface': profile.get('surface_temp'),
                            'thermocline_depth': profile.get('thermocline_depth')
                        },
                        'salinity': {
                            'surface': profile.get('surface_sal'),
                            'min_depth': profile.get('salinity_min_depth'),
                            'max_depth': profile.get('salinity_max_depth')
                        },
                        'stratification': profile.get('mean_stratification')
                    },
                    metadata={
                        'quality_flag': profile.get('quality_flag', ''),
                        'data_mode': profile.get('data_mode', ''),
                        'source': 'sql_query'
                    }
                )
                results.append(result)
                
        except Exception as e:
            logger.error(f"Failed to convert SQL results: {e}")
        
        return results

    def _convert_semantic_results(self, raw_results: Dict[str, Any]) -> List[ARGOResult]:
        """Convert semantic search results to structured format"""
        results = []
        
        try:
            data = json.loads(raw_results) if isinstance(raw_results, str) else raw_results
            search_results = data.get('data', {}).get('profiles', [])
            similarities = data.get('data', {}).get('similarities', [])
            
            for i, profile in enumerate(search_results):
                similarity = similarities[i] if i < len(similarities) else 0.0
                
                result = ARGOResult(
                    id=profile.get('id', ''),
                    float_id=profile.get('platform_number', ''),
                    cycle_number=profile.get('cycle_number', 0),
                    location={
                        'latitude': profile.get('latitude', 0.0),
                        'longitude': profile.get('longitude', 0.0)
                    },
                    timestamp=profile.get('date', ''),
                    variables={
                        'temperature': {
                            'surface': profile.get('surface_temp'),
                            'thermocline_depth': profile.get('thermocline_depth')
                        },
                        'salinity': {
                            'surface': profile.get('surface_sal'),
                            'min_depth': profile.get('salinity_min_depth'),
                            'max_depth': profile.get('salinity_max_depth')
                        },
                        'stratification': profile.get('mean_stratification')
                    },
                    metadata={
                        'quality_flag': profile.get('quality_flag', ''),
                        'data_mode': profile.get('data_mode', ''),
                        'source': 'semantic_search'
                    },
                    similarity_score=similarity,
                    rag_context=f"Semantic similarity: {similarity:.3f}"
                )
                results.append(result)
                
        except Exception as e:
            logger.error(f"Failed to convert semantic results: {e}")
        
        return results

    def _merge_results(self, results: List[ARGOResult], context: QueryContext) -> Dict[str, Any]:
        """Merge results into structured JSON output"""
        
        # Calculate summary statistics
        if results:
            latitudes = [r.location['latitude'] for r in results]
            longitudes = [r.location['longitude'] for r in results]
            
            temps = [r.variables.get('temperature', {}).get('surface') 
                    for r in results if r.variables.get('temperature', {}).get('surface') is not None]
            
            salts = [r.variables.get('salinity', {}).get('surface') 
                    for r in results if r.variables.get('salinity', {}).get('surface') is not None]
        else:
            latitudes = longitudes = temps = salts = []
        
        merged = {
            "query_context": {
                "original_query": context.original_query,
                "intent": context.intent.value,
                "confidence": context.confidence,
                "sql_query": context.sql_query,
                "semantic_query": context.semantic_query
            },
            "results_summary": {
                "total_profiles": len(results),
                "geographic_bounds": {
                    "lat_range": [min(latitudes), max(latitudes)] if latitudes else [0, 0],
                    "lon_range": [min(longitudes), max(longitudes)] if longitudes else [0, 0]
                },
                "variable_ranges": {
                    "temperature": {
                        "min": min(temps) if temps else None,
                        "max": max(temps) if temps else None,
                        "mean": sum(temps) / len(temps) if temps else None
                    },
                    "salinity": {
                        "min": min(salts) if salts else None,
                        "max": max(salts) if salts else None,
                        "mean": sum(salts) / len(salts) if salts else None
                    }
                }
            },
            "profiles": [asdict(result) for result in results]
        }
        
        return merged

    async def _generate_response(self, query: str, merged_data: Dict[str, Any], context: QueryContext) -> str:
        """Generate natural language response using LLM"""
        
        try:
            # Create a concise summary for the LLM
            summary = {
                "query": query,
                "intent": context.intent.value,
                "total_results": merged_data["results_summary"]["total_profiles"],
                "geographic_bounds": merged_data["results_summary"]["geographic_bounds"],
                "variable_ranges": merged_data["results_summary"]["variable_ranges"]
            }
            
            # Include sample profiles for context
            sample_profiles = merged_data["profiles"][:3]  # First 3 profiles
            
            response = await self.openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert oceanographer providing insights on ARGO profile data.
                        Generate a comprehensive, natural language response that:
                        1. Directly answers the user's query
                        2. Summarizes key findings from the data
                        3. Provides oceanographic context and interpretation
                        4. Mentions data quality and limitations if relevant
                        5. Uses scientific terminology appropriately
                        
                        Be concise but informative. Focus on the most relevant insights."""
                    },
                    {
                        "role": "user",
                        "content": f"""User Query: "{query}"
                        
                        Data Summary: {json.dumps(summary, indent=2)}
                        
                        Sample Profiles: {json.dumps(sample_profiles, indent=2)}
                        
                        Please provide a comprehensive response to the user's query based on this ARGO data."""
                    }
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Response generation failed: {e}")
            
            # Fallback response
            total = merged_data["results_summary"]["total_profiles"]
            return f"Found {total} ARGO profiles matching your query '{query}'. The data includes oceanographic measurements from various locations and time periods. Please check the detailed results for specific values and metadata."

# Example usage and testing
async def main():
    """Example usage of the RAG pipeline"""
    
    # Initialize pipeline (you'll need to provide your OpenAI API key)
    pipeline = RAGPipeline(
        openai_api_key="your-openai-api-key-here",
        mcp_server_path="node server/mcp/index.js"
    )
    
    try:
        await pipeline.initialize()
        
        # Test queries
        test_queries = [
            "Find warm water profiles in the Pacific Ocean",
            "Show me ARGO profiles with temperature > 25°C",
            "Get profiles from the North Atlantic in 2024",
            "Find deep water measurements with high salinity",
            "What are the temperature characteristics of tropical waters?"
        ]
        
        for query in test_queries:
            print(f"\n{'='*60}")
            print(f"Query: {query}")
            print('='*60)
            
            try:
                response = await pipeline.process_query(query)
                
                print(f"Intent: {response.intent.value}")
                print(f"Results: {len(response.results)} profiles")
                print(f"Execution time: {response.metadata['execution_time']:.2f}s")
                print(f"\nResponse:\n{response.natural_language_response}")
                
                # Print first result as example
                if response.results:
                    first_result = response.results[0]
                    print(f"\nExample Profile:")
                    print(f"  ID: {first_result.id}")
                    print(f"  Location: {first_result.location}")
                    print(f"  Temperature: {first_result.variables.get('temperature', {}).get('surface')}°C")
                    print(f"  Salinity: {first_result.variables.get('salinity', {}).get('surface')} PSU")
                
            except Exception as e:
                print(f"Query failed: {e}")
        
    finally:
        await pipeline.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
