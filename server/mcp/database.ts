import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { ARGOProfile, ARGOQueryResult, IndianOceanAnalysis, EnhancedARGOProfile } from "./types.js"

export class SupabaseConnection {
  private client: SupabaseClient
  private readonly maxRetries = 3
  private readonly retryDelay = 1000

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY required")
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  async executeQuery(sql: string, page = 1, pageSize = 100): Promise<ARGOQueryResult> {
    const startTime = Date.now()

    try {
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize

      // Add pagination to the SQL query
      const paginatedSql = `${sql} LIMIT ${pageSize} OFFSET ${offset}`

      // Execute the main query using direct SQL
      const { data, error } = await this.client
        .from("argo_profiles")
        .select("*")
        .limit(pageSize)
        .range(offset, offset + pageSize - 1)

      if (error) {
        throw new Error(`SQL execution failed: ${error.message}`)
      }

      // Get total count for pagination metadata
      const { count, error: countError } = await this.client
        .from("argo_profiles")
        .select("*", { count: "exact", head: true })

      const totalCount = countError ? 0 : count || 0
      const hasNext = page * pageSize < totalCount

      // Transform data to match our interface
      const transformedData = (data || []).map(this.transformDatabaseRow)

      return {
        data: transformedData,
        metadata: {
          total_count: totalCount,
          page,
          page_size: pageSize,
          has_next: hasNext,
          query_time: new Date().toISOString(),
          source: "supabase_postgres",
        },
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      throw new Error(
        `Database query failed after ${executionTime}ms: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  private transformDatabaseRow(row: any): ARGOProfile {
    return {
      id: row.id?.toString() || "",
      file: row.file,
      date: row.date,
      lat: row.lat,
      lon: row.lon,
      mld: row.mld,
      thermoclinedepth: row.thermoclinedepth,
      salinitymindepth: row.salinitymindepth,
      salinitymaxdepth: row.salinitymaxdepth,
      meanstratification: row.meanstratification,
      ohc_0_200m: row.ohc_0_200m,
      surfacetemp: row.surfacetemp,
      surfacesal: row.surfacesal,
      n_levels: row.n_levels,
      direction: row.direction,
      location_name: this.generateLocationName(row.lat, row.lon),
      ocean_basin: "Indian Ocean",
    }
  }

  async getProfilesByLocation(lat: number, lon: number, radius = 100): Promise<ARGOProfile[]> {
    try {
      // Use Supabase PostGIS functions for geographic queries
      const { data, error } = await this.client.rpc("profiles_within_radius", {
        center_lat: lat,
        center_lon: lon,
        radius_km: radius,
      })

      if (error) {
        // Fallback to simple bounding box query
        const latRange = radius / 111.0 // Approximate km per degree
        const lonRange = radius / (111.0 * Math.cos((lat * Math.PI) / 180))

        const { data: fallbackData, error: fallbackError } = await this.client
          .from("argo_profiles")
          .select("*")
          .gte("lat", lat - latRange)
          .lte("lat", lat + latRange)
          .gte("lon", lon - lonRange)
          .lte("lon", lon + lonRange)
          .order("date", { ascending: false })

        if (fallbackError) throw fallbackError
        return (fallbackData || []).map(this.transformDatabaseRow)
      }

      return (data || []).map(this.transformDatabaseRow)
    } catch (error) {
      throw new Error(`Location query failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async getProfilesByDateRange(startDate: string, endDate: string): Promise<ARGOProfile[]> {
    try {
      const { data, error } = await this.client
        .from("argo_profiles")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformDatabaseRow)
    } catch (error) {
      throw new Error(`Date range query failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async getProfilesByTemperatureRange(minTemp: number, maxTemp: number): Promise<ARGOProfile[]> {
    try {
      const { data, error } = await this.client
        .from("argo_profiles")
        .select("*")
        .gte("surfacetemp", minTemp)
        .lte("surfacetemp", maxTemp)
        .order("surfacetemp", { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformDatabaseRow)
    } catch (error) {
      throw new Error(`Temperature range query failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async getProfilesByMixedLayerDepth(minMLD: number, maxMLD: number): Promise<ARGOProfile[]> {
    try {
      const { data, error } = await this.client
        .from("argo_profiles")
        .select("*")
        .gte("mld", minMLD)
        .lte("mld", maxMLD)
        .not("mld", "is", null)
        .order("mld", { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformDatabaseRow)
    } catch (error) {
      throw new Error(`Mixed layer depth query failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async getProfilesByHeatContent(minOHC: number, maxOHC: number): Promise<ARGOProfile[]> {
    try {
      const { data, error } = await this.client
        .from("argo_profiles")
        .select("*")
        .gte("ohc_0_200m", minOHC)
        .lte("ohc_0_200m", maxOHC)
        .not("ohc_0_200m", "is", null)
        .order("ohc_0_200m", { ascending: false })

      if (error) throw error

      return (data || []).map(this.transformDatabaseRow)
    } catch (error) {
      throw new Error(`Heat content query failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  enhanceProfileWithAnalysis(profile: ARGOProfile): EnhancedARGOProfile {
    const analysis: IndianOceanAnalysis = {
      monsoon_classification: this.classifyMonsoonPeriod(new Date(profile.date)),
      thermal_structure: this.analyzeThermalStructure(profile),
      water_mass_type: this.classifyWaterMass(profile),
      heat_content_category: this.categorizeHeatContent(profile.ohc_0_200m),
      stratification_level: this.analyzeStratification(profile.meanstratification),
    }

    const searchTags = this.generateSearchTags(profile, analysis)
    const ragContext = this.generateRAGContext(profile, analysis)

    return {
      ...profile,
      analysis,
      search_tags: searchTags,
      rag_context: ragContext,
    }
  }

  private generateLocationName(lat: number, lon: number): string {
    // Indian Ocean region classification
    if (lat > -10) return "Northern Indian Ocean"
    if (lat > -20) return "Central Indian Ocean"
    if (lat > -30) return "Southern Indian Ocean"
    return "Southern Ocean (Indian sector)"
  }

  private classifyMonsoonPeriod(date: Date): string {
    const month = date.getMonth() + 1
    if (month >= 6 && month <= 9) return "Southwest Monsoon"
    if (month >= 12 || month <= 2) return "Northeast Monsoon"
    return "Inter-monsoon"
  }

  private analyzeThermalStructure(profile: ARGOProfile): string {
    if (!profile.mld || !profile.thermoclinedepth) return "Unknown"

    const mldThermoclineRatio = profile.mld / profile.thermoclinedepth

    if (mldThermoclineRatio > 0.8) return "Well-mixed"
    if (mldThermoclineRatio > 0.4) return "Moderately stratified"
    return "Highly stratified"
  }

  private classifyWaterMass(profile: ARGOProfile): string {
    if (!profile.surfacetemp || !profile.surfacesal) return "Unknown"

    const temp = profile.surfacetemp
    const sal = profile.surfacesal

    if (temp > 28 && sal < 35) return "Bay of Bengal Surface Water"
    if (temp > 27 && sal > 35.5) return "Arabian Sea Surface Water"
    if (temp > 25 && temp < 28) return "Indian Ocean Central Water"
    if (temp < 25) return "Indian Ocean Deep Water"

    return "Mixed Water Mass"
  }

  private categorizeHeatContent(ohc?: number): string {
    if (!ohc) return "Unknown"

    const ohcNormalized = ohc / 1e8
    if (ohcNormalized > 3.0) return "High"
    if (ohcNormalized > 2.5) return "Moderate"
    return "Low"
  }

  private analyzeStratification(stratification?: number): string {
    if (!stratification) return "Unknown"

    if (stratification > 0.03) return "Highly stratified"
    if (stratification > 0.02) return "Moderately stratified"
    return "Weakly stratified"
  }

  private generateSearchTags(profile: ARGOProfile, analysis: IndianOceanAnalysis): string[] {
    const tags = [
      "indian_ocean",
      analysis.monsoon_classification.toLowerCase().replace(/\s+/g, "_"),
      analysis.thermal_structure.toLowerCase().replace(/\s+/g, "_"),
      analysis.water_mass_type.toLowerCase().replace(/\s+/g, "_"),
      analysis.heat_content_category.toLowerCase(),
      analysis.stratification_level.toLowerCase().replace(/\s+/g, "_"),
    ]

    // Add temperature tags
    if (profile.surfacetemp) {
      if (profile.surfacetemp > 29) tags.push("very_warm")
      else if (profile.surfacetemp > 27) tags.push("warm")
      else if (profile.surfacetemp > 25) tags.push("moderate_temp")
      else tags.push("cool")
    }

    // Add mixed layer depth tags
    if (profile.mld) {
      if (profile.mld > 60) tags.push("deep_mixed_layer")
      else if (profile.mld > 30) tags.push("moderate_mixed_layer")
      else tags.push("shallow_mixed_layer")
    }

    return tags
  }

  private generateRAGContext(profile: ARGOProfile, analysis: IndianOceanAnalysis): string {
    return `Indian Ocean ARGO profile (ID: ${profile.id}) collected on ${profile.date} at ${profile.lat.toFixed(2)}°S, ${profile.lon.toFixed(2)}°E.
    
    Environmental Context:
    - Monsoon period: ${analysis.monsoon_classification}
    - Thermal structure: ${analysis.thermal_structure}
    - Water mass type: ${analysis.water_mass_type}
    
    Key Measurements:
    - Mixed layer depth: ${profile.mld?.toFixed(1) || "N/A"}m
    - Thermocline depth: ${profile.thermoclinedepth?.toFixed(1) || "N/A"}m
    - Surface temperature: ${profile.surfacetemp?.toFixed(1) || "N/A"}°C
    - Surface salinity: ${profile.surfacesal?.toFixed(2) || "N/A"} PSU
    - Ocean heat content (0-200m): ${profile.ohc_0_200m ? (profile.ohc_0_200m / 1e8).toFixed(1) + "e8 J/m²" : "N/A"}
    - Mean stratification: ${profile.meanstratification?.toFixed(3) || "N/A"} s⁻²
    
    Analysis:
    - Heat content category: ${analysis.heat_content_category}
    - Stratification level: ${analysis.stratification_level}
    - Profile contains ${profile.n_levels || "unknown"} measurement levels
    
    This profile represents ${analysis.monsoon_classification.toLowerCase()} conditions in the ${profile.location_name} region.`
  }

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.client.from("argo_profiles").select("count").limit(1)
      return !error
    } catch {
      return false
    }
  }
}
