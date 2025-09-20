import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import openai
from dataclasses import dataclass
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MCPToolCall:
    """Represents a call to an MCP tool"""
    tool_name: str
    arguments: Dict[str, Any]
    call_id: str

@dataclass
class MCPToolResponse:
    """Response from an MCP tool"""
    call_id: str
    success: bool
    data: Any = None
    error: str = None
    metadata: Dict[str, Any] = None

class ARGOLLMAgent:
    """LLM Agent that uses MCP Server tools to answer ARGO oceanographic queries"""
    
    def __init__(self, openai_api_key: str, model: str = "gpt-4"):
        self.client = openai.OpenAI(api_key=openai_api_key)
        self.model = model
        self.conversation_history = []
        
        self.system_prompt = """You are an expert oceanographic data analyst specializing in Indian Ocean ARGO float data. 

INDIAN OCEAN ARGO DATABASE SCHEMA:
- id: Profile identifier
- file: Source data file
- date: Profile timestamp
- lat, lon: Geographic coordinates
- mld: Mixed Layer Depth (meters)
- thermoclinedepth: Thermocline depth (meters)
- salinitymindepth: Depth of minimum salinity (meters)
- salinitymaxdepth: Depth of maximum salinity (meters)
- meanstratification: Mean stratification index
- ohc_0_200m: Ocean Heat Content 0-200m (J/m²)
- surfacetemp: Sea surface temperature (°C)
- surfacesal: Sea surface salinity (PSU)
- n_levels: Number of measurement levels
- direction: Profile direction (ascending/descending)

AVAILABLE TOOLS:
1. queryARGO - Execute SQL queries on argo_profiles table
   - Use for: Statistical analysis, filtering by specific criteria, aggregations
   - Parameters: sql (required), page (optional), pageSize (optional)
   - Example: "SELECT * FROM argo_profiles WHERE lat BETWEEN -10 AND 10 AND mld > 50"

2. retrieveARGO - Semantic vector search using natural language
   - Use for: Conceptual queries, finding similar oceanographic conditions
   - Parameters: query (required), limit (optional)
   - Example: "deep mixed layer profiles during monsoon season"

3. getARGOByLocation - Find profiles near geographic coordinates
   - Parameters: latitude (required), longitude (required), radius (optional)

4. getARGOByDateRange - Retrieve profiles within date range
   - Parameters: startDate (required), endDate (required), page (optional), pageSize (optional)

INDIAN OCEAN CONTEXT:
- Monsoon seasons: SW Monsoon (June-September), NE Monsoon (December-March)
- Key features: Equatorial currents, upwelling zones, warm pool regions
- Thermal structure: Strong thermoclines, variable mixed layer depths
- Salinity patterns: Bay of Bengal freshening, Arabian Sea high salinity
- Heat content: Significant seasonal and interannual variability

RESPONSE GUIDELINES:
- Always provide oceanographic context specific to the Indian Ocean
- Interpret mixed layer depth in relation to monsoon patterns
- Explain thermocline structure and its implications
- Relate salinity patterns to regional freshwater inputs
- Include heat content analysis for climate relevance
- Reference monsoon seasonality when relevant
- Use proper oceanographic units and terminology

When you need to use a tool, format your response as:
TOOL_CALL: {"tool": "toolName", "arguments": {...}, "call_id": "unique_id"}"""

    async def process_query(self, user_query: str) -> str:
        """Process a user query and return a comprehensive response"""
        try:
            # Add user query to conversation history
            self.conversation_history.append({
                "role": "user", 
                "content": user_query
            })
            
            # Get LLM response with tool calls
            response = await self._get_llm_response()
            
            # Process any tool calls
            if self._contains_tool_calls(response):
                tool_results = await self._execute_tool_calls(response)
                
                # Get final response with tool results
                final_response = await self._get_final_response(tool_results)
                return final_response
            else:
                return response
                
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return f"I encountered an error while processing your query: {str(e)}"

    async def _get_llm_response(self) -> str:
        """Get initial response from LLM"""
        messages = [
            {"role": "system", "content": self.system_prompt},
            *self.conversation_history
        ]
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.1,
            max_tokens=1500
        )
        
        return response.choices[0].message.content

    def _contains_tool_calls(self, response: str) -> bool:
        """Check if response contains tool calls"""
        return "TOOL_CALL:" in response

    async def _execute_tool_calls(self, response: str) -> List[MCPToolResponse]:
        """Extract and execute tool calls from LLM response"""
        tool_calls = self._extract_tool_calls(response)
        results = []
        
        for tool_call in tool_calls:
            try:
                # Simulate MCP tool execution (in real implementation, this would call MCP server)
                result = await self._simulate_mcp_call(tool_call)
                results.append(result)
            except Exception as e:
                logger.error(f"Tool call failed: {e}")
                results.append(MCPToolResponse(
                    call_id=tool_call.call_id,
                    success=False,
                    error=str(e)
                ))
        
        return results

    def _extract_tool_calls(self, response: str) -> List[MCPToolCall]:
        """Extract tool calls from LLM response"""
        tool_calls = []
        
        # Find all TOOL_CALL patterns
        pattern = r'TOOL_CALL:\s*({[^}]+})'
        matches = re.findall(pattern, response)
        
        for i, match in enumerate(matches):
            try:
                call_data = json.loads(match)
                tool_calls.append(MCPToolCall(
                    tool_name=call_data["tool"],
                    arguments=call_data["arguments"],
                    call_id=call_data.get("call_id", f"call_{i}")
                ))
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse tool call: {e}")
        
        return tool_calls

    async def _simulate_mcp_call(self, tool_call: MCPToolCall) -> MCPToolResponse:
        """Simulate MCP tool call (replace with actual MCP client in production)"""
        # This is a simulation - in production, this would call the actual MCP server
        
        if tool_call.tool_name == "queryARGO":
            return await self._simulate_query_argo(tool_call)
        elif tool_call.tool_name == "retrieveARGO":
            return await self._simulate_retrieve_argo(tool_call)
        elif tool_call.tool_name == "getARGOByLocation":
            return await self._simulate_location_search(tool_call)
        elif tool_call.tool_name == "getARGOByDateRange":
            return await self._simulate_date_range_search(tool_call)
        else:
            return MCPToolResponse(
                call_id=tool_call.call_id,
                success=False,
                error=f"Unknown tool: {tool_call.tool_name}"
            )

    async def _simulate_query_argo(self, tool_call: MCPToolCall) -> MCPToolResponse:
        """Simulate SQL query execution with Indian Ocean ARGO data"""
        sample_data = [
            {
                "id": 1,
                "file": "D1901393_001.nc",
                "date": "2023-06-15T12:00:00Z",
                "lat": -5.2,
                "lon": 67.8,
                "mld": 45.5,
                "thermoclinedepth": 120.3,
                "salinitymindepth": 85.2,
                "salinitymaxdepth": 200.1,
                "meanstratification": 0.0045,
                "ohc_0_200m": 2.8e9,
                "surfacetemp": 28.5,
                "surfacesal": 35.2,
                "n_levels": 156,
                "direction": "ascending"
            },
            {
                "id": 2,
                "file": "D1901394_002.nc", 
                "date": "2023-07-20T12:00:00Z",
                "lat": -8.1,
                "lon": 72.3,
                "mld": 32.8,
                "thermoclinedepth": 95.7,
                "salinitymindepth": 75.4,
                "salinitymaxdepth": 180.6,
                "meanstratification": 0.0052,
                "ohc_0_200m": 3.1e9,
                "surfacetemp": 29.2,
                "surfacesal": 34.8,
                "n_levels": 142,
                "direction": "ascending"
            }
        ]
        
        return MCPToolResponse(
            call_id=tool_call.call_id,
            success=True,
            data={
                "data": sample_data,
                "metadata": {
                    "total_count": len(sample_data),
                    "page": 1,
                    "page_size": 100,
                    "has_next": False,
                    "query_time": datetime.now().isoformat(),
                    "source": "supabase_postgres",
                    "region": "Indian Ocean"
                }
            },
            metadata={
                "timestamp": datetime.now().isoformat(),
                "source": "supabase_postgres",
                "execution_time": 150,
                "region": "Indian Ocean"
            }
        )

    async def _simulate_retrieve_argo(self, tool_call: MCPToolCall) -> MCPToolResponse:
        """Simulate vector search with Indian Ocean context"""
        sample_data = {
            "profiles": [
                {
                    "id": 3,
                    "file": "D1901395_003.nc",
                    "date": "2023-08-01T12:00:00Z",
                    "lat": -12.5,
                    "lon": 78.9,
                    "mld": 28.3,
                    "thermoclinedepth": 85.2,
                    "salinitymindepth": 65.1,
                    "salinitymaxdepth": 150.8,
                    "meanstratification": 0.0058,
                    "ohc_0_200m": 3.4e9,
                    "surfacetemp": 30.1,
                    "surfacesal": 34.5,
                    "n_levels": 138,
                    "direction": "ascending",
                    "summary": "SW Monsoon profile with shallow mixed layer, strong thermocline, typical Bay of Bengal characteristics with reduced surface salinity"
                }
            ],
            "similarities": [0.92],
            "metadata": {
                "query": tool_call.arguments.get("query", ""),
                "total_results": 1,
                "search_time": datetime.now().isoformat(),
                "source": "faiss_vector_search",
                "region": "Indian Ocean",
                "seasonal_context": "SW Monsoon period"
            }
        }
        
        return MCPToolResponse(
            call_id=tool_call.call_id,
            success=True,
            data=sample_data,
            metadata={
                "timestamp": datetime.now().isoformat(),
                "source": "faiss_vector_search",
                "execution_time": 85,
                "region": "Indian Ocean"
            }
        )

    async def _simulate_location_search(self, tool_call: MCPToolCall) -> MCPToolResponse:
        """Simulate location-based search"""
        args = tool_call.arguments
        sample_data = {
            "profiles": [
                {
                    "id": "argo_loc_001",
                    "platform_number": "1901396",
                    "latitude": args["latitude"] + 0.1,
                    "longitude": args["longitude"] - 0.1,
                    "date": "2023-03-01T12:00:00Z",
                    "surface_temp": 20.1,
                    "surface_sal": 36.5
                }
            ],
            "location": {
                "latitude": args["latitude"],
                "longitude": args["longitude"],
                "radius": args.get("radius", 100)
            },
            "count": 1
        }
        
        return MCPToolResponse(
            call_id=tool_call.call_id,
            success=True,
            data=sample_data,
            metadata={
                "timestamp": datetime.now().isoformat(),
                "source": "supabase_postgres",
                "execution_time": 120
            }
        )

    async def _simulate_date_range_search(self, tool_call: MCPToolCall) -> MCPToolResponse:
        """Simulate date range search"""
        args = tool_call.arguments
        sample_data = {
            "profiles": [
                {
                    "id": "argo_date_001",
                    "platform_number": "1901397",
                    "latitude": 25.5,
                    "longitude": -80.2,
                    "date": "2023-06-15T12:00:00Z",
                    "surface_temp": 28.5,
                    "surface_sal": 36.8
                }
            ],
            "dateRange": {
                "startDate": args["startDate"],
                "endDate": args["endDate"]
            },
            "count": 1
        }
        
        return MCPToolResponse(
            call_id=tool_call.call_id,
            success=True,
            data=sample_data,
            metadata={
                "timestamp": datetime.now().isoformat(),
                "source": "supabase_postgres",
                "execution_time": 95
            }
        )

    async def _get_final_response(self, tool_results: List[MCPToolResponse]) -> str:
        """Generate final response using tool results"""
        # Prepare tool results for LLM
        results_summary = []
        for result in tool_results:
            if result.success:
                results_summary.append({
                    "call_id": result.call_id,
                    "success": True,
                    "data": result.data,
                    "metadata": result.metadata
                })
            else:
                results_summary.append({
                    "call_id": result.call_id,
                    "success": False,
                    "error": result.error
                })
        
        # Create final prompt with results
        final_prompt = f"""
Based on the tool execution results below, provide a comprehensive answer to the user's query.

TOOL RESULTS:
{json.dumps(results_summary, indent=2)}

Please:
1. Synthesize the data into a coherent response
2. Include relevant oceanographic context and interpretation
3. Highlight key findings and patterns
4. Mention data quality and reliability where relevant
5. Use appropriate scientific terminology
6. Format the response clearly with proper units

Provide a natural language response that directly answers the user's question.
"""
        
        messages = [
            {"role": "system", "content": self.system_prompt},
            *self.conversation_history,
            {"role": "user", "content": final_prompt}
        ]
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.1,
            max_tokens=2000
        )
        
        final_answer = response.choices[0].message.content
        
        # Add to conversation history
        self.conversation_history.append({
            "role": "assistant",
            "content": final_answer
        })
        
        return final_answer

# Example usage and testing
async def main():
    """Example usage of the ARGO LLM Agent"""
    
    # Initialize agent (you would use your actual OpenAI API key)
    agent = ARGOLLMAgent(openai_api_key="your-openai-api-key-here")
    
    # Example queries
    test_queries = [
        "Find ARGO profiles with warm surface temperatures in the Indian Ocean",
        "What are the salinity patterns near the Arabian Sea?",
        "Show me temperature data from the Bay of Bengal in 2023",
        "Find profiles with unusual thermocline characteristics"
    ]
    
    for query in test_queries:
        print(f"\n{'='*60}")
        print(f"Query: {query}")
        print(f"{'='*60}")
        
        try:
            response = await agent.process_query(query)
            print(f"Response: {response}")
        except Exception as e:
            print(f"Error: {e}")
        
        print("\n" + "-"*60)

if __name__ == "__main__":
    asyncio.run(main())
