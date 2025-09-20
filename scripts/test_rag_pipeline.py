#!/usr/bin/env python3
"""
Comprehensive test suite for RAG + MCP pipeline validation.
Tests SQL mode, semantic mode, and hybrid mode queries.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
import sys
import os

# Add the scripts directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from llm_agent import ARGOLLMAgent, MCPToolResponse

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RAGPipelineValidator:
    """Validates RAG + MCP pipeline with comprehensive test queries"""
    
    def __init__(self, openai_api_key: str):
        self.agent = ARGOLLMAgent(openai_api_key)
        self.test_results = []
        
    async def run_all_tests(self):
        """Run all validation tests"""
        logger.info("Starting RAG + MCP Pipeline Validation")
        logger.info("=" * 80)
        
        # SQL Mode Tests
        await self._test_sql_mode()
        
        # Semantic Mode Tests  
        await self._test_semantic_mode()
        
        # Hybrid Mode Tests
        await self._test_hybrid_mode()
        
        # Generate validation report
        self._generate_validation_report()
        
    async def _test_sql_mode(self):
        """Test structured queries that should use SQL (queryARGO)"""
        logger.info("\n🔍 TESTING SQL MODE")
        logger.info("-" * 50)
        
        sql_queries = [
            {
                "query": "Show me 5 profiles from the Indian Ocean in 2010",
                "expected_tool": "queryARGO",
                "description": "Structured query with specific location and date filters"
            },
            {
                "query": "Count all ARGO profiles with temperature above 25°C in the Pacific",
                "expected_tool": "queryARGO", 
                "description": "Aggregation query with temperature threshold"
            },
            {
                "query": "List profiles from platform 1901393 between January and March 2023",
                "expected_tool": "queryARGO",
                "description": "Platform-specific query with date range"
            },
            {
                "query": "Find the average salinity in the Atlantic Ocean for 2022",
                "expected_tool": "queryARGO",
                "description": "Statistical aggregation query"
            }
        ]
        
        for test_case in sql_queries:
            await self._execute_test_case("SQL", test_case)
            
    async def _test_semantic_mode(self):
        """Test unstructured queries that should use vector search (retrieveARGO)"""
        logger.info("\n🧠 TESTING SEMANTIC MODE")
        logger.info("-" * 50)
        
        semantic_queries = [
            {
                "query": "Where are the warmest waters recorded?",
                "expected_tool": "retrieveARGO",
                "description": "Conceptual query about temperature patterns"
            },
            {
                "query": "Find profiles with unusual oceanographic conditions",
                "expected_tool": "retrieveARGO",
                "description": "Exploratory query for anomalies"
            },
            {
                "query": "Show me deep water formations in polar regions",
                "expected_tool": "retrieveARGO",
                "description": "Complex oceanographic concept search"
            },
            {
                "query": "Locate areas with strong thermoclines",
                "expected_tool": "retrieveARGO",
                "description": "Physical oceanography feature search"
            }
        ]
        
        for test_case in semantic_queries:
            await self._execute_test_case("SEMANTIC", test_case)
            
    async def _test_hybrid_mode(self):
        """Test complex queries that should use both SQL and vector search"""
        logger.info("\n🔄 TESTING HYBRID MODE")
        logger.info("-" * 50)
        
        hybrid_queries = [
            {
                "query": "Compare salinity trends in Pacific vs Atlantic from 2000–2010",
                "expected_tools": ["queryARGO", "retrieveARGO"],
                "description": "Comparative analysis requiring both structured and semantic search"
            },
            {
                "query": "Analyze temperature anomalies in the Gulf Stream region and find similar patterns globally",
                "expected_tools": ["queryARGO", "retrieveARGO"],
                "description": "Regional analysis with global pattern matching"
            },
            {
                "query": "Find El Niño impact signatures in Pacific temperature data and compare with historical patterns",
                "expected_tools": ["queryARGO", "retrieveARGO"],
                "description": "Climate pattern analysis with historical comparison"
            }
        ]
        
        for test_case in hybrid_queries:
            await self._execute_test_case("HYBRID", test_case)
            
    async def _execute_test_case(self, mode: str, test_case: Dict[str, Any]):
        """Execute a single test case and validate results"""
        query = test_case["query"]
        logger.info(f"\n📝 Testing: {query}")
        logger.info(f"   Expected: {test_case.get('expected_tool', test_case.get('expected_tools', 'Unknown'))}")
        
        try:
            # Execute query
            start_time = datetime.now()
            response = await self.agent.process_query(query)
            end_time = datetime.now()
            execution_time = (end_time - start_time).total_seconds()
            
            # Validate response
            validation_result = self._validate_response(response, test_case, mode)
            
            # Store test result
            test_result = {
                "mode": mode,
                "query": query,
                "description": test_case["description"],
                "response": response,
                "execution_time": execution_time,
                "validation": validation_result,
                "timestamp": datetime.now().isoformat()
            }
            
            self.test_results.append(test_result)
            
            # Log result
            status = "✅ PASS" if validation_result["passed"] else "❌ FAIL"
            logger.info(f"   Result: {status} ({execution_time:.2f}s)")
            
            if not validation_result["passed"]:
                logger.warning(f"   Issues: {', '.join(validation_result['issues'])}")
                
        except Exception as e:
            logger.error(f"   Error: {str(e)}")
            self.test_results.append({
                "mode": mode,
                "query": query,
                "description": test_case["description"],
                "error": str(e),
                "validation": {"passed": False, "issues": [f"Execution error: {str(e)}"]},
                "timestamp": datetime.now().isoformat()
            })
            
    def _validate_response(self, response: str, test_case: Dict[str, Any], mode: str) -> Dict[str, Any]:
        """Validate response quality and completeness"""
        issues = []
        
        # Check for basic response quality
        if not response or len(response.strip()) < 50:
            issues.append("Response too short or empty")
            
        # Check for tool usage indicators
        expected_tools = test_case.get("expected_tools", [test_case.get("expected_tool")])
        if expected_tools and expected_tools[0]:
            tool_mentioned = any(tool in response for tool in expected_tools if tool)
            if not tool_mentioned and "TOOL_CALL:" not in response:
                issues.append("Expected tool usage not detected in response")
                
        # Check for required components
        required_components = [
            ("raw values", ["temperature", "salinity", "pressure", "data", "profile"]),
            ("metadata", ["location", "timestamp", "latitude", "longitude", "date"]),
            ("summary", ["analysis", "pattern", "trend", "finding", "result"])
        ]
        
        for component_name, keywords in required_components:
            if not any(keyword.lower() in response.lower() for keyword in keywords):
                issues.append(f"Missing {component_name} in response")
                
        # Check for oceanographic context
        oceanographic_terms = ["ocean", "temperature", "salinity", "depth", "profile", "water", "marine"]
        if not any(term.lower() in response.lower() for term in oceanographic_terms):
            issues.append("Lacks oceanographic context")
            
        # Mode-specific validations
        if mode == "SQL":
            if "query" not in response.lower() and "sql" not in response.lower():
                issues.append("SQL mode should mention database querying")
                
        elif mode == "SEMANTIC":
            if "search" not in response.lower() and "similar" not in response.lower():
                issues.append("Semantic mode should mention search or similarity")
                
        elif mode == "HYBRID":
            if len([tool for tool in ["query", "search", "analysis"] if tool in response.lower()]) < 2:
                issues.append("Hybrid mode should show evidence of multiple approaches")
                
        return {
            "passed": len(issues) == 0,
            "issues": issues,
            "score": max(0, 100 - len(issues) * 20)  # Simple scoring system
        }
        
    def _generate_validation_report(self):
        """Generate comprehensive validation report"""
        logger.info("\n" + "=" * 80)
        logger.info("📊 VALIDATION REPORT")
        logger.info("=" * 80)
        
        # Summary statistics
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result.get("validation", {}).get("passed", False))
        failed_tests = total_tests - passed_tests
        
        logger.info(f"\n📈 SUMMARY:")
        logger.info(f"   Total Tests: {total_tests}")
        logger.info(f"   Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
        logger.info(f"   Failed: {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
        
        # Mode breakdown
        modes = {}
        for result in self.test_results:
            mode = result["mode"]
            if mode not in modes:
                modes[mode] = {"total": 0, "passed": 0}
            modes[mode]["total"] += 1
            if result.get("validation", {}).get("passed", False):
                modes[mode]["passed"] += 1
                
        logger.info(f"\n📊 BY MODE:")
        for mode, stats in modes.items():
            pass_rate = stats["passed"] / stats["total"] * 100 if stats["total"] > 0 else 0
            logger.info(f"   {mode}: {stats['passed']}/{stats['total']} ({pass_rate:.1f}%)")
            
        # Failed tests details
        if failed_tests > 0:
            logger.info(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result.get("validation", {}).get("passed", False):
                    logger.info(f"   • {result['query'][:60]}...")
                    issues = result.get("validation", {}).get("issues", [])
                    for issue in issues[:3]:  # Show first 3 issues
                        logger.info(f"     - {issue}")
                        
        # Performance metrics
        execution_times = [r.get("execution_time", 0) for r in self.test_results if "execution_time" in r]
        if execution_times:
            avg_time = sum(execution_times) / len(execution_times)
            max_time = max(execution_times)
            min_time = min(execution_times)
            
            logger.info(f"\n⏱️  PERFORMANCE:")
            logger.info(f"   Average Response Time: {avg_time:.2f}s")
            logger.info(f"   Fastest Response: {min_time:.2f}s")
            logger.info(f"   Slowest Response: {max_time:.2f}s")
            
        # Save detailed report
        report_file = f"rag_validation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump({
                "summary": {
                    "total_tests": total_tests,
                    "passed_tests": passed_tests,
                    "failed_tests": failed_tests,
                    "pass_rate": passed_tests/total_tests*100 if total_tests > 0 else 0
                },
                "mode_breakdown": modes,
                "performance": {
                    "avg_time": avg_time if execution_times else 0,
                    "max_time": max_time if execution_times else 0,
                    "min_time": min_time if execution_times else 0
                },
                "detailed_results": self.test_results,
                "timestamp": datetime.now().isoformat()
            }, f, indent=2)
            
        logger.info(f"\n💾 Detailed report saved to: {report_file}")
        logger.info("=" * 80)

async def main():
    """Main test execution function"""
    # You would replace this with your actual OpenAI API key
    api_key = os.getenv("OPENAI_API_KEY", "your-openai-api-key-here")
    
    if api_key == "your-openai-api-key-here":
        logger.warning("⚠️  Using placeholder API key. Set OPENAI_API_KEY environment variable for actual testing.")
        
    validator = RAGPipelineValidator(api_key)
    await validator.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
