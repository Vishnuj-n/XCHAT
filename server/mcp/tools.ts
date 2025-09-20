import type { Tool } from "@modelcontextprotocol/sdk/types.js"
import { SupabaseConnection } from "./database.js"
import { FAISSVectorSearch } from "./vector-search.js"
import type { MCPToolResponse } from "./types.js"

export class ARGOTools {
  private db: SupabaseConnection
  private vectorSearch: FAISSVectorSearch

  constructor() {
    this.db = new SupabaseConnection()
    this.vectorSearch = new FAISSVectorSearch()
  }

  getToolDefinitions(): Tool[] {
    return [
      {
        name: "queryARGO",
        description:
          "Execute SQL queries on Indian Ocean ARGO oceanographic data in Supabase PostgreSQL database. Use for structured queries about specific measurements, locations, or time periods.",
        inputSchema: {
          type: "object",
          properties: {
            sql: {
              type: "string",
              description:
                "SQL query to execute on argo_profiles table. Available columns: id, file, date, lat, lon, mld (mixed layer depth), thermoclinedepth, salinitymindepth, salinitymaxdepth, meanstratification, ohc_0_200m (ocean heat content), surfacetemp, surfacesal, n_levels, direction",
            },
            page: {
              type: "number",
              description: "Page number for pagination (default: 1)",
              default: 1,
            },
            pageSize: {
              type: "number",
              description: "Number of results per page (default: 100, max: 1000)",
              default: 100,
            },
          },
          required: ["sql"],
        },
      },
      {
        name: "retrieveARGO",
        description:
          "Perform semantic vector search on Indian Ocean ARGO profiles using natural language queries. Use for exploratory questions about oceanographic conditions, patterns, or phenomena.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Natural language query describing the ARGO profiles to find (e.g., 'warm water during southwest monsoon', 'deep mixed layers in northern Indian Ocean')",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 10)",
              default: 10,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "getARGOByMonsoon",
        description: "Find ARGO profiles during specific monsoon periods in the Indian Ocean",
        inputSchema: {
          type: "object",
          properties: {
            monsoonPeriod: {
              type: "string",
              enum: ["Southwest", "Northeast", "Inter-monsoon"],
              description: "Monsoon period to search for",
            },
            year: {
              type: "number",
              description: "Specific year to search (optional)",
            },
          },
          required: ["monsoonPeriod"],
        },
      },
      {
        name: "getARGOByThermalStructure",
        description: "Find ARGO profiles with specific thermal structure characteristics",
        inputSchema: {
          type: "object",
          properties: {
            structure: {
              type: "string",
              enum: ["Well-mixed", "Moderately stratified", "Highly stratified"],
              description: "Thermal structure type to search for",
            },
            minMLD: {
              type: "number",
              description: "Minimum mixed layer depth in meters",
            },
            maxMLD: {
              type: "number",
              description: "Maximum mixed layer depth in meters",
            },
          },
          required: ["structure"],
        },
      },
      {
        name: "getARGOByHeatContent",
        description: "Find ARGO profiles with specific ocean heat content levels",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["High", "Moderate", "Low"],
              description: "Heat content category to search for",
            },
            minOHC: {
              type: "number",
              description: "Minimum ocean heat content (0-200m) in J/m²",
            },
            maxOHC: {
              type: "number",
              description: "Maximum ocean heat content (0-200m) in J/m²",
            },
          },
          required: ["category"],
        },
      },
      {
        name: "getARGOByLocation",
        description: "Find ARGO profiles near a specific geographic location in the Indian Ocean",
        inputSchema: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude coordinate (negative for Southern Hemisphere)",
            },
            longitude: {
              type: "number",
              description: "Longitude coordinate (Indian Ocean: ~20°E to 120°E)",
            },
            radius: {
              type: "number",
              description: "Search radius in kilometers (default: 100)",
              default: 100,
            },
          },
          required: ["latitude", "longitude"],
        },
      },
      {
        name: "getARGOByDateRange",
        description: "Retrieve Indian Ocean ARGO profiles within a specific date range",
        inputSchema: {
          type: "object",
          properties: {
            startDate: {
              type: "string",
              description: "Start date in YYYY-MM-DD format",
            },
            endDate: {
              type: "string",
              description: "End date in YYYY-MM-DD format",
            },
            page: {
              type: "number",
              description: "Page number for pagination (default: 1)",
              default: 1,
            },
            pageSize: {
              type: "number",
              description: "Number of results per page (default: 100)",
              default: 100,
            },
          },
          required: ["startDate", "endDate"],
        },
      },
    ]
  }

  async executeQueryARGO(args: any): Promise<MCPToolResponse> {
    const startTime = Date.now()

    try {
      const { sql, page = 1, pageSize = 100 } = args

      // Validate page size
      const validatedPageSize = Math.min(Math.max(pageSize, 1), 1000)

      // Execute the SQL query
      const result = await this.db.executeQuery(sql, page, validatedPageSize)

      const executionTime = Date.now() - startTime

      return {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          source: "supabase_postgres",
          execution_time: executionTime,
        },
      }
    } catch (error) {
      const executionTime = Date.now() - startTime

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        metadata: {
          timestamp: new Date().toISOString(),
          source: "supabase_postgres",
          execution_time: executionTime,
        },
      }
    }
  }

  async executeRetrieveARGO(args: any): Promise<MCPToolResponse> {
    const startTime = Date.now()

    try {
      const { query, limit = 10 } = args

      // Perform vector search
      const result = await this.vectorSearch.search(query, limit)

      const executionTime = Date.now() - startTime

      return {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          source: "faiss_vector_search",
          execution_time: executionTime,
        },
      }
    } catch (error) {
      const executionTime = Date.now() - startTime

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        metadata: {
          timestamp: new Date().toISOString(),
          source: "faiss_vector_search",
          execution_time: executionTime,
        },
      }
    }
  }

  async executeGetARGOByMonsoon(args: any): Promise<MCPToolResponse> {
    const startTime = Date.now()

    try {
      const { monsoonPeriod, year } = args

      // Define date ranges for monsoon periods
      let dateFilter = ""
      if (year) {
        switch (monsoonPeriod) {
          case "Southwest":
            dateFilter = `date >= '${year}-06-01' AND date <= '${year}-09-30'`
            break
          case "Northeast":
            dateFilter = `(date >= '${year}-12-01' OR date <= '${year + 1}-02-28')`
            break
          case "Inter-monsoon":
            dateFilter = `((date >= '${year}-03-01' AND date <= '${year}-05-31') OR (date >= '${year}-10-01' AND date <= '${year}-11-30'))`
            break
        }
      }

      const profiles = dateFilter
        ? await this.db.executeQuery(`SELECT * FROM argo_profiles WHERE ${dateFilter} ORDER BY date DESC`)
        : await this.db.executeQuery(`SELECT * FROM argo_profiles ORDER BY date DESC`)

      const executionTime = Date.now() - startTime

      return {
        success: true,
        data: {
          profiles: profiles.data,
          monsoon_period: monsoonPeriod,
          year,
          count: profiles.data.length,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: "supabase_postgres",
          execution_time: executionTime,
        },
      }
    } catch (error) {
      const executionTime = Date.now() - startTime

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        metadata: {
          timestamp: new Date().toISOString(),
          source: "supabase_postgres",
          execution_time: executionTime,
        },
      }
    }
  }

  async executeGetARGOByThermalStructure(args: any): Promise<MCPToolResponse> {
    const startTime = Date.now()

    try {
      const { structure, minMLD, maxMLD } = args

      let query = "SELECT * FROM argo_profiles WHERE mld IS NOT NULL"

      if (minMLD !== undefined) query += ` AND mld >= ${minMLD}`
      if (maxMLD !== undefined) query += ` AND mld <= ${maxMLD}`

      query += " ORDER BY mld DESC"

      const profiles = await this.db.executeQuery(query)

      // Filter by thermal structure (this would ideally be computed in the database)
      const filteredProfiles = profiles.data.filter((profile) => {
        const enhancedProfile = this.db.enhanceProfileWithAnalysis(profile)
        return enhancedProfile.analysis.thermal_structure === structure
      })

      const executionTime = Date.now() - startTime

      return {
        success: true,
        data: {
          profiles: filteredProfiles,
          thermal_structure: structure,
          count: filteredProfiles.length,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: "supabase_postgres",
          execution_time: executionTime,
        },
      }
    } catch (error) {
      const executionTime = Date.now() - startTime

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        metadata: {
          timestamp: new Date().toISOString(),
          source: "supabase_postgres",
          execution_time: executionTime,
        },
      }
    }
  }

  async executeGetARGOByHeatContent(args: any): Promise<MCPToolResponse> {
    const startTime = Date.now()

    try {
      const { category, minOHC, maxOHC } = args

      let query = "SELECT * FROM argo_profiles WHERE ohc_0_200m IS NOT NULL"

      if (minOHC !== undefined) query += ` AND ohc_0_200m >= ${minOHC}`
      if (maxOHC !== undefined) query += ` AND ohc_0_200m <= ${maxOHC}`

      query += " ORDER BY ohc_0_200m DESC"

      const profiles = await this.db.executeQuery(query)

      // Filter by heat content category
      const filteredProfiles = profiles.data.filter((profile) => {
        const enhancedProfile = this.db.enhanceProfileWithAnalysis(profile)
        return enhancedProfile.analysis.heat_content_category === category
      })

      const executionTime = Date.now() - startTime

      return {
        success: true,
        data: {
          profiles: filteredProfiles,
          heat_content_category: category,
          count: filteredProfiles.length,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: "supabase_postgres",
          execution_time: executionTime,
        },
      }
    } catch (error) {
      const executionTime = Date.now() - startTime

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        metadata: {
          timestamp: new Date().toISOString(),
          source: "supabase_postgres",
          execution_time: executionTime,
        },
      }
    }
  }

  async executeGetARGOByLocation(args: any): Promise<MCPToolResponse> {
    const startTime = Date.now()

    try {
      const { latitude, longitude, radius = 100 } = args

      // Validate coordinates
      if (latitude < -90 || latitude > 90) {
        throw new Error("Latitude must be between -90 and 90")
      }
      if (longitude < -180 || longitude > 180) {
        throw new Error("Longitude must be between -180 and 180")
      }

      const profiles = await this.db.getProfilesByLocation(latitude, longitude, radius)

      const executionTime = Date.now() - startTime

      return {
        success: true,
        data: {
          profiles,
          location: { latitude, longitude, radius },
          count: profiles.length,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: "supabase_postgres",
          execution_time: executionTime,
        },
      }
    } catch (error) {
      const executionTime = Date.now() - startTime

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        metadata: {
          timestamp: new Date().toISOString(),
          source: "supabase_postgres",
          execution_time: executionTime,
        },
      }
    }
  }

  async executeGetARGOByDateRange(args: any): Promise<MCPToolResponse> {
    const startTime = Date.now()

    try {
      const { startDate, endDate, page = 1, pageSize = 100 } = args

      // Validate dates
      const start = new Date(startDate)
      const end = new Date(endDate)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date format. Use YYYY-MM-DD")
      }

      if (start > end) {
        throw new Error("Start date must be before end date")
      }

      const profiles = await this.db.getProfilesByDateRange(startDate, endDate)

      const executionTime = Date.now() - startTime

      return {
        success: true,
        data: {
          profiles,
          dateRange: { startDate, endDate },
          count: profiles.length,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: "supabase_postgres",
          execution_time: executionTime,
        },
      }
    } catch (error) {
      const executionTime = Date.now() - startTime

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        metadata: {
          timestamp: new Date().toISOString(),
          source: "supabase_postgres",
          execution_time: executionTime,
        },
      }
    }
  }
}
