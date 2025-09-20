#!/usr/bin/env python3
"""
Predefined test queries for RAG + MCP pipeline validation.
Organized by query type and expected behavior.
"""

from typing import Dict, List, Any

class TestQueryLibrary:
    """Library of test queries for comprehensive RAG pipeline validation"""
    
    @staticmethod
    def get_sql_mode_queries() -> List[Dict[str, Any]]:
        """Queries that should trigger SQL mode (queryARGO)"""
        return [
            {
                "query": "Show me 5 profiles from the Indian Ocean in 2010",
                "expected_tool": "queryARGO",
                "expected_sql_pattern": "WHERE.*latitude.*longitude.*date.*2010",
                "description": "Geographic and temporal filtering",
                "validation_criteria": [
                    "Should return exactly 5 profiles",
                    "All profiles should be from Indian Ocean coordinates",
                    "All profiles should be from 2010",
                    "Should include raw temperature and salinity values"
                ]
            },
            {
                "query": "Count all ARGO profiles with surface temperature above 25°C",
                "expected_tool": "queryARGO",
                "expected_sql_pattern": "COUNT.*temperature.*>.*25",
                "description": "Aggregation with temperature threshold",
                "validation_criteria": [
                    "Should return a count number",
                    "Should specify temperature threshold criteria",
                    "Should include metadata about query execution"
                ]
            },
            {
                "query": "List profiles from platform 1901393 between January and March 2023",
                "expected_tool": "queryARGO",
                "expected_sql_pattern": "platform_number.*1901393.*date.*2023",
                "description": "Platform-specific temporal query",
                "validation_criteria": [
                    "Should filter by specific platform number",
                    "Should include date range filtering",
                    "Should return profile metadata and measurements"
                ]
            },
            {
                "query": "Find the average salinity in the Atlantic Ocean for 2022",
                "expected_tool": "queryARGO",
                "expected_sql_pattern": "AVG.*salinity.*Atlantic.*2022",
                "description": "Statistical aggregation with geographic filter",
                "validation_criteria": [
                    "Should calculate average salinity",
                    "Should filter for Atlantic Ocean region",
                    "Should include confidence intervals or data quality info"
                ]
            },
            {
                "query": "Show profiles with quality flag 'A' sorted by temperature descending",
                "expected_tool": "queryARGO",
                "expected_sql_pattern": "quality_flag.*A.*ORDER BY.*temperature.*DESC",
                "description": "Quality filtering with sorting",
                "validation_criteria": [
                    "Should filter by quality flag",
                    "Should sort by temperature in descending order",
                    "Should explain data quality significance"
                ]
            }
        ]
    
    @staticmethod
    def get_semantic_mode_queries() -> List[Dict[str, Any]]:
        """Queries that should trigger semantic mode (retrieveARGO)"""
        return [
            {
                "query": "Where are the warmest waters recorded?",
                "expected_tool": "retrieveARGO",
                "expected_concepts": ["warm", "temperature", "maximum", "tropical"],
                "description": "Conceptual temperature pattern search",
                "validation_criteria": [
                    "Should identify regions with highest temperatures",
                    "Should provide geographic context",
                    "Should explain oceanographic reasons for warm waters"
                ]
            },
            {
                "query": "Find profiles with unusual oceanographic conditions",
                "expected_tool": "retrieveARGO",
                "expected_concepts": ["anomaly", "unusual", "outlier", "extreme"],
                "description": "Anomaly detection query",
                "validation_criteria": [
                    "Should identify statistical outliers",
                    "Should explain what makes conditions unusual",
                    "Should provide oceanographic context for anomalies"
                ]
            },
            {
                "query": "Show me deep water formations in polar regions",
                "expected_tool": "retrieveARGO",
                "expected_concepts": ["deep water", "polar", "formation", "convection"],
                "description": "Complex oceanographic process search",
                "validation_criteria": [
                    "Should identify polar regions",
                    "Should explain deep water formation processes",
                    "Should include relevant temperature/salinity characteristics"
                ]
            },
            {
                "query": "Locate areas with strong thermoclines",
                "expected_tool": "retrieveARGO",
                "expected_concepts": ["thermocline", "temperature gradient", "stratification"],
                "description": "Physical oceanography feature search",
                "validation_criteria": [
                    "Should identify regions with strong temperature gradients",
                    "Should explain thermocline significance",
                    "Should provide depth and temperature information"
                ]
            },
            {
                "query": "Find water masses with Mediterranean characteristics",
                "expected_tool": "retrieveARGO",
                "expected_concepts": ["Mediterranean", "water mass", "salinity", "intermediate"],
                "description": "Water mass identification",
                "validation_criteria": [
                    "Should identify high-salinity intermediate waters",
                    "Should explain Mediterranean water mass properties",
                    "Should show geographic distribution"
                ]
            }
        ]
    
    @staticmethod
    def get_hybrid_mode_queries() -> List[Dict[str, Any]]:
        """Queries that should trigger both SQL and semantic modes"""
        return [
            {
                "query": "Compare salinity trends in Pacific vs Atlantic from 2000–2010",
                "expected_tools": ["queryARGO", "retrieveARGO"],
                "expected_operations": ["temporal analysis", "regional comparison", "trend calculation"],
                "description": "Multi-basin comparative analysis",
                "validation_criteria": [
                    "Should analyze both Pacific and Atlantic regions",
                    "Should cover the specified time period",
                    "Should identify and compare trends",
                    "Should provide statistical significance of differences"
                ]
            },
            {
                "query": "Analyze temperature anomalies in the Gulf Stream region and find similar patterns globally",
                "expected_tools": ["queryARGO", "retrieveARGO"],
                "expected_operations": ["anomaly detection", "pattern matching", "global search"],
                "description": "Regional analysis with global pattern matching",
                "validation_criteria": [
                    "Should focus on Gulf Stream region initially",
                    "Should identify temperature anomalies",
                    "Should find similar patterns in other regions",
                    "Should explain oceanographic connections"
                ]
            },
            {
                "query": "Find El Niño impact signatures in Pacific temperature data and compare with historical patterns",
                "expected_tools": ["queryARGO", "retrieveARGO"],
                "expected_operations": ["climate pattern analysis", "historical comparison", "impact assessment"],
                "description": "Climate pattern analysis with historical context",
                "validation_criteria": [
                    "Should identify El Niño temperature signatures",
                    "Should provide historical context",
                    "Should compare current vs historical patterns",
                    "Should explain climate impact mechanisms"
                ]
            },
            {
                "query": "Identify upwelling regions and quantify their seasonal temperature variations from 2020-2023",
                "expected_tools": ["queryARGO", "retrieveARGO"],
                "expected_operations": ["upwelling detection", "seasonal analysis", "quantitative assessment"],
                "description": "Process identification with quantitative seasonal analysis",
                "validation_criteria": [
                    "Should identify major upwelling regions",
                    "Should quantify seasonal temperature changes",
                    "Should provide statistical measures of variation",
                    "Should explain upwelling processes"
                ]
            }
        ]
    
    @staticmethod
    def get_edge_case_queries() -> List[Dict[str, Any]]:
        """Edge cases and challenging queries for robustness testing"""
        return [
            {
                "query": "What is the meaning of life?",
                "expected_behavior": "polite_refusal",
                "description": "Off-topic query handling",
                "validation_criteria": [
                    "Should politely redirect to oceanographic topics",
                    "Should not attempt to use ARGO tools",
                    "Should maintain professional tone"
                ]
            },
            {
                "query": "Find profiles with temperature = NULL",
                "expected_tool": "queryARGO",
                "expected_behavior": "handle_null_values",
                "description": "NULL value handling",
                "validation_criteria": [
                    "Should handle NULL values appropriately",
                    "Should explain data quality implications",
                    "Should suggest alternative queries if needed"
                ]
            },
            {
                "query": "Show me profiles from the year 3000",
                "expected_behavior": "temporal_validation",
                "description": "Invalid date range handling",
                "validation_criteria": [
                    "Should recognize invalid future date",
                    "Should suggest valid date ranges",
                    "Should explain ARGO program timeline"
                ]
            },
            {
                "query": "Find profiles at latitude 200 degrees",
                "expected_behavior": "coordinate_validation",
                "description": "Invalid coordinate handling",
                "validation_criteria": [
                    "Should recognize invalid latitude",
                    "Should explain valid coordinate ranges",
                    "Should suggest corrected query"
                ]
            }
        ]
    
    @staticmethod
    def get_performance_test_queries() -> List[Dict[str, Any]]:
        """Queries designed to test system performance and scalability"""
        return [
            {
                "query": "Analyze all ARGO profiles from 2000 to 2023",
                "expected_behavior": "large_dataset_handling",
                "description": "Large dataset query",
                "validation_criteria": [
                    "Should handle large result sets efficiently",
                    "Should implement pagination if needed",
                    "Should provide progress indicators",
                    "Should complete within reasonable time"
                ]
            },
            {
                "query": "Find the most similar profile to platform 1901393 cycle 1",
                "expected_tool": "retrieveARGO",
                "expected_behavior": "similarity_search",
                "description": "Complex similarity computation",
                "validation_criteria": [
                    "Should compute profile similarities efficiently",
                    "Should return ranked results",
                    "Should explain similarity metrics used"
                ]
            }
        ]
    
    @staticmethod
    def get_all_test_queries() -> Dict[str, List[Dict[str, Any]]]:
        """Get all test queries organized by category"""
        return {
            "sql_mode": TestQueryLibrary.get_sql_mode_queries(),
            "semantic_mode": TestQueryLibrary.get_semantic_mode_queries(),
            "hybrid_mode": TestQueryLibrary.get_hybrid_mode_queries(),
            "edge_cases": TestQueryLibrary.get_edge_case_queries(),
            "performance": TestQueryLibrary.get_performance_test_queries()
        }

# Example usage
if __name__ == "__main__":
    library = TestQueryLibrary()
    all_queries = library.get_all_test_queries()
    
    print("RAG Pipeline Test Query Library")
    print("=" * 50)
    
    for category, queries in all_queries.items():
        print(f"\n{category.upper()} ({len(queries)} queries):")
        for i, query in enumerate(queries, 1):
            print(f"  {i}. {query['query']}")
