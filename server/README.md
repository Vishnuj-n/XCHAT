# ARGO MCP Server

A Model Context Protocol (MCP) server for querying and analyzing ARGO oceanographic data using Supabase PostgreSQL and FAISS vector search.

## Features

- **SQL Querying**: Execute complex SQL queries on ARGO profile data
- **Vector Search**: Semantic search using FAISS for natural language queries
- **Location-based Search**: Find profiles near specific coordinates
- **Date Range Filtering**: Retrieve profiles within time periods
- **Pagination**: Handle large datasets efficiently
- **Structured Responses**: JSON responses with metadata and timestamps

## Setup

1. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Variables**:
   Copy `.env.example` to `.env` and configure:
   \`\`\`env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

3. **Database Schema**:
   Ensure your Supabase database has an `argo_profiles` table with columns:
   - `id`, `platform_number`, `cycle_number`
   - `latitude`, `longitude`, `date`
   - `thermocline_depth`, `salinity_min_depth`, `salinity_max_depth`
   - `mean_stratification`, `surface_temp`, `surface_sal`
   - `quality_flag`, `data_mode`

## Usage

### Start the Server
\`\`\`bash
npm run mcp:dev
\`\`\`

### Available Tools

#### 1. queryARGO
Execute SQL queries on ARGO data:
\`\`\`json
{
  "name": "queryARGO",
  "arguments": {
    "sql": "SELECT * FROM argo_profiles WHERE latitude BETWEEN -10 AND 10 ORDER BY date DESC",
    "page": 1,
    "pageSize": 50
  }
}
\`\`\`

#### 2. retrieveARGO
Semantic vector search:
\`\`\`json
{
  "name": "retrieveARGO",
  "arguments": {
    "query": "Show me salinity profiles near the equator in March 2023",
    "limit": 10
  }
}
\`\`\`

#### 3. getARGOByLocation
Location-based search:
\`\`\`json
{
  "name": "getARGOByLocation",
  "arguments": {
    "latitude": 0.0,
    "longitude": -140.0,
    "radius": 100
  }
}
\`\`\`

#### 4. getARGOByDateRange
Date range filtering:
\`\`\`json
{
  "name": "getARGOByDateRange",
  "arguments": {
    "startDate": "2023-03-01",
    "endDate": "2023-03-31"
  }
}
\`\`\`

## Response Format

All tools return structured JSON responses:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2025-01-19T...",
    "source": "supabase_postgres",
    "execution_time": 150
  }
}
\`\`\`

## Integration with Claude Desktop

Add to your Claude Desktop config:
\`\`\`json
{
  "mcpServers": {
    "argo-server": {
      "command": "node",
      "args": ["path/to/server/mcp/index.js"],
      "env": {
        "SUPABASE_URL": "your_url",
        "SUPABASE_ANON_KEY": "your_key"
      }
    }
  }
}
