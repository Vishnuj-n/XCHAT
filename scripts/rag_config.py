"""
Configuration settings for the RAG Pipeline
"""

import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class RAGConfig:
    """RAG Pipeline configuration"""
    
    # OpenAI Configuration
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = "gpt-4"
    embedding_model: str = "text-embedding-3-small"
    
    # MCP Server Configuration
    mcp_server_path: str = "node server/mcp/index.js"
    mcp_timeout: int = 30
    
    # Query Processing Configuration
    default_sql_limit: int = 100
    default_semantic_limit: int = 10
    intent_confidence_threshold: float = 0.7
    
    # Response Generation Configuration
    max_response_tokens: int = 1000
    response_temperature: float = 0.3
    
    # Logging Configuration
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    @classmethod
    def from_env(cls) -> "RAGConfig":
        """Create configuration from environment variables"""
        return cls(
            openai_api_key=os.getenv("OPENAI_API_KEY", ""),
            openai_model=os.getenv("OPENAI_MODEL", "gpt-4"),
            embedding_model=os.getenv("EMBEDDING_MODEL", "text-embedding-3-small"),
            mcp_server_path=os.getenv("MCP_SERVER_PATH", "node server/mcp/index.js"),
            mcp_timeout=int(os.getenv("MCP_TIMEOUT", "30")),
            default_sql_limit=int(os.getenv("DEFAULT_SQL_LIMIT", "100")),
            default_semantic_limit=int(os.getenv("DEFAULT_SEMANTIC_LIMIT", "10")),
            intent_confidence_threshold=float(os.getenv("INTENT_CONFIDENCE_THRESHOLD", "0.7")),
            max_response_tokens=int(os.getenv("MAX_RESPONSE_TOKENS", "1000")),
            response_temperature=float(os.getenv("RESPONSE_TEMPERATURE", "0.3")),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
        )
    
    def validate(self) -> bool:
        """Validate configuration"""
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is required")
        
        if not os.path.exists(self.mcp_server_path.split()[1]):
            raise ValueError(f"MCP server not found at: {self.mcp_server_path}")
        
        return True
