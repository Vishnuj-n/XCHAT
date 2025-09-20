import OpenAI from "openai"

export interface ArgoProfile {
  id: string
  file?: string
  date: string
  lat: number
  lon: number
  mld?: number // Mixed Layer Depth
  thermoclinedepth?: number
  salinitymindepth?: number
  salinitymaxdepth?: number
  meanstratification?: number
  ohc_0_200m?: number // Ocean Heat Content 0-200m
  surfacetemp?: number
  surfacesal?: number
  n_levels?: number
  direction?: string
  // Computed fields for display
  location_name?: string
  ocean_basin?: string
  data_quality?: string
}

export interface ArgoVectorMetadata {
  // Primary identification
  id: string // Primary key matching Supabase row ID
  file?: string

  // Textual summary for RAG enrichment
  summary: string // Rich textual description of profile

  // Temporal information
  timestamp: string // ISO format timestamp
  date_collected: string

  // Geospatial information
  location: {
    latitude: number
    longitude: number
    name?: string // Human-readable location name
    ocean_basin: string
    region?: string // e.g., "Northern Indian Ocean", "Southern Indian Ocean"
  }

  // Indian Ocean specific measurements
  measurements: {
    mixed_layer_depth?: number
    thermocline_depth?: number
    salinity_min_depth?: number
    salinity_max_depth?: number
    mean_stratification?: number
    ocean_heat_content_0_200m?: number
    surface_temperature?: number
    surface_salinity?: number
    profile_levels?: number
    direction?: string
  }

  // Environmental context for RAG
  environmental_context: {
    season: string // "Winter", "Spring", "Summer", "Fall"
    monsoon_period?: string // "Southwest", "Northeast", "Inter-monsoon"
    water_mass_type?: string // "Surface", "Intermediate", "Deep"
    oceanographic_features?: string[] // ["Upwelling", "Eddy", "Front", "Thermocline"]
    thermal_structure?: string // "Well-mixed", "Stratified", "Thermocline present"
  }

  // Search and retrieval optimization
  search_tags: string[] // Searchable keywords
  embedding_text: string // Text used for embedding generation
}

export interface VectorSearchResult {
  profile: ArgoProfile
  similarity: number
  metadata: ArgoVectorMetadata
  rag_context: string // Rich context for RAG applications
}

export interface EmbeddingMetadata extends ArgoVectorMetadata {
  vector_id: number // Index in vector store
  embedding: number[] // The actual embedding vector
  embedding_model: string
  created_at: string
  updated_at: string
}

class VectorSearchEngine {
  private vectorStore: EmbeddingMetadata[] = []
  private openai: OpenAI
  private isInitialized = false

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY || "your-api-key-here",
    })
  }

  async initialize() {
    try {
      this.isInitialized = true
      console.log("[v0] Indian Ocean ARGO vector search initialized")
    } catch (error) {
      console.error("[v0] Failed to initialize vector search:", error)
      throw error
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must have the same length")
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }

    normA = Math.sqrt(normA)
    normB = Math.sqrt(normB)

    if (normA === 0 || normB === 0) {
      return 0
    }

    return dotProduct / (normA * normB)
  }

  private extractTextContent(profile: ArgoProfile): string {
    const location = profile.location_name || `${profile.lat.toFixed(2)}°S, ${profile.lon.toFixed(2)}°E`

    // Determine monsoon period from date
    const monsoonPeriod = this.getMonsoonPeriod(new Date(profile.date))
    const season = this.getSeason(new Date(profile.date))

    // Generate rich textual description for Indian Ocean data
    return `Indian Ocean ARGO profile from file ${profile.file || "unknown"}.
    Location: ${location} (${profile.lat.toFixed(3)}°S, ${profile.lon.toFixed(3)}°E) in the Indian Ocean.
    Collected on ${profile.date} during ${season} (${monsoonPeriod} monsoon period).
    Mixed layer depth: ${profile.mld?.toFixed(1) || "N/A"}m.
    Thermocline depth: ${profile.thermoclinedepth?.toFixed(1) || "N/A"}m.
    Surface temperature: ${profile.surfacetemp?.toFixed(1) || "N/A"}°C.
    Surface salinity: ${profile.surfacesal?.toFixed(2) || "N/A"} PSU.
    Ocean heat content (0-200m): ${profile.ohc_0_200m ? (profile.ohc_0_200m / 1e8).toFixed(1) + "e8 J/m²" : "N/A"}.
    Mean stratification: ${profile.meanstratification?.toFixed(3) || "N/A"} s⁻².
    Profile levels: ${profile.n_levels || "N/A"} measurements.
    Direction: ${profile.direction || "N/A"}.
    Salinity extrema depths: ${profile.salinitymindepth?.toFixed(0) || "N/A"}m (min) to ${profile.salinitymaxdepth?.toFixed(0) || "N/A"}m (max).
    Oceanographic characteristics: ${this.getIndianOceanFeatures(profile)}.`
  }

  private calculateStats(data: number[]): { min: number; max: number; mean: number } {
    if (data.length === 0) return { min: 0, max: 0, mean: 0 }

    const min = Math.min(...data)
    const max = Math.max(...data)
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length

    return { min, max, mean }
  }

  private getSeason(date: Date): string {
    const month = date.getMonth() + 1
    if (month >= 3 && month <= 5) return "Spring"
    if (month >= 6 && month <= 8) return "Summer"
    if (month >= 9 && month <= 11) return "Fall"
    return "Winter"
  }

  private getMonsoonPeriod(date: Date): string {
    const month = date.getMonth() + 1
    if (month >= 6 && month <= 9) return "Southwest"
    if (month >= 12 || month <= 2) return "Northeast"
    return "Inter-monsoon"
  }

  private getIndianOceanFeatures(profile: ArgoProfile): string {
    const features: string[] = []

    // Mixed layer analysis
    if (profile.mld) {
      if (profile.mld > 60) features.push("deep mixed layer")
      else if (profile.mld > 30) features.push("moderate mixed layer")
      else features.push("shallow mixed layer")
    }

    // Thermocline analysis
    if (profile.thermoclinedepth) {
      if (profile.thermoclinedepth < 100) features.push("shallow thermocline")
      else if (profile.thermoclinedepth > 150) features.push("deep thermocline")
      else features.push("moderate thermocline")
    }

    // Stratification analysis
    if (profile.meanstratification) {
      if (profile.meanstratification > 0.03) features.push("highly stratified")
      else if (profile.meanstratification > 0.02) features.push("moderately stratified")
      else features.push("weakly stratified")
    }

    // Temperature analysis
    if (profile.surfacetemp) {
      if (profile.surfacetemp > 29) features.push("very warm surface")
      else if (profile.surfacetemp > 27) features.push("warm surface")
      else if (profile.surfacetemp > 25) features.push("moderate surface temperature")
      else features.push("cool surface")
    }

    // Ocean heat content analysis
    if (profile.ohc_0_200m) {
      const ohc = profile.ohc_0_200m / 1e8
      if (ohc > 3.0) features.push("high heat content")
      else if (ohc > 2.5) features.push("moderate heat content")
      else features.push("low heat content")
    }

    return features.join(", ") || "standard Indian Ocean profile"
  }

  private createVectorMetadata(profile: ArgoProfile, textContent: string): ArgoVectorMetadata {
    const date = new Date(profile.date)
    const season = this.getSeason(date)
    const monsoonPeriod = this.getMonsoonPeriod(date)

    return {
      id: profile.id,
      file: profile.file,

      summary: textContent,

      timestamp: date.toISOString(),
      date_collected: profile.date,

      location: {
        latitude: profile.lat,
        longitude: profile.lon,
        name: profile.location_name,
        ocean_basin: "Indian Ocean",
        region: this.getIndianOceanRegion(profile.lat, profile.lon),
      },

      measurements: {
        mixed_layer_depth: profile.mld,
        thermocline_depth: profile.thermoclinedepth,
        salinity_min_depth: profile.salinitymindepth,
        salinity_max_depth: profile.salinitymaxdepth,
        mean_stratification: profile.meanstratification,
        ocean_heat_content_0_200m: profile.ohc_0_200m,
        surface_temperature: profile.surfacetemp,
        surface_salinity: profile.surfacesal,
        profile_levels: profile.n_levels,
        direction: profile.direction,
      },

      environmental_context: {
        season,
        monsoon_period: monsoonPeriod,
        water_mass_type: this.classifyIndianOceanWaterMass(profile),
        oceanographic_features: this.getIndianOceanFeatures(profile).split(", "),
        thermal_structure: this.getThermalStructure(profile),
      },

      search_tags: this.generateIndianOceanSearchTags(profile),
      embedding_text: textContent,
    }
  }

  private getIndianOceanRegion(lat: number, lon: number): string {
    if (lat > -10) return "Northern Indian Ocean"
    if (lat > -20) return "Central Indian Ocean"
    if (lat > -30) return "Southern Indian Ocean"
    return "Southern Ocean (Indian sector)"
  }

  private classifyIndianOceanWaterMass(profile: ArgoProfile): string {
    if (!profile.surfacetemp || !profile.surfacesal) return "Unknown"

    const temp = profile.surfacetemp
    const sal = profile.surfacesal

    if (temp > 28 && sal < 35) return "Bay of Bengal Surface Water"
    if (temp > 27 && sal > 35.5) return "Arabian Sea Surface Water"
    if (temp > 25 && temp < 28) return "Indian Ocean Central Water"
    if (temp < 25) return "Indian Ocean Deep Water"

    return "Mixed Water Mass"
  }

  private getThermalStructure(profile: ArgoProfile): string {
    if (!profile.mld || !profile.thermoclinedepth) return "Unknown"

    const mldThermoclineRatio = profile.mld / profile.thermoclinedepth

    if (mldThermoclineRatio > 0.8) return "Well-mixed"
    if (mldThermoclineRatio > 0.4) return "Moderately stratified"
    return "Highly stratified"
  }

  private generateIndianOceanSearchTags(profile: ArgoProfile): string[] {
    const tags: string[] = [
      "indian_ocean",
      this.getSeason(new Date(profile.date)).toLowerCase(),
      this.getMonsoonPeriod(new Date(profile.date)).toLowerCase().replace(" ", "_"),
      this.classifyIndianOceanWaterMass(profile).toLowerCase().replace(/\s+/g, "_"),
    ]

    // Temperature-based tags
    if (profile.surfacetemp) {
      if (profile.surfacetemp > 29) tags.push("very_warm", "tropical")
      else if (profile.surfacetemp > 27) tags.push("warm", "subtropical")
      else if (profile.surfacetemp > 25) tags.push("moderate_temp")
      else tags.push("cool")
    }

    // Salinity-based tags
    if (profile.surfacesal) {
      if (profile.surfacesal > 35.5) tags.push("high_salinity", "arabian_sea_type")
      else if (profile.surfacesal < 34.5) tags.push("low_salinity", "bay_of_bengal_type")
      else tags.push("normal_salinity")
    }

    // Mixed layer depth tags
    if (profile.mld) {
      if (profile.mld > 60) tags.push("deep_mixed_layer")
      else if (profile.mld > 30) tags.push("moderate_mixed_layer")
      else tags.push("shallow_mixed_layer")
    }

    // Heat content tags
    if (profile.ohc_0_200m) {
      const ohc = profile.ohc_0_200m / 1e8
      if (ohc > 3.0) tags.push("high_heat_content")
      else if (ohc > 2.5) tags.push("moderate_heat_content")
      else tags.push("low_heat_content")
    }

    return tags
  }

  private generateRAGContext(metadata: ArgoVectorMetadata, similarity: number, query: string): string {
    const measurements = metadata.measurements

    return `This Indian Ocean ARGO profile (ID: ${metadata.id}) from ${metadata.location.name || "unknown location"} 
    shows ${similarity > 0.8 ? "high" : similarity > 0.6 ? "moderate" : "low"} relevance to your query "${query}".
    
    Key characteristics:
    - Location: ${metadata.location.latitude.toFixed(2)}°S, ${metadata.location.longitude.toFixed(2)}°E in ${metadata.location.region}
    - Time: ${metadata.date_collected} (${metadata.environmental_context.season}, ${metadata.environmental_context.monsoon_period} monsoon)
    - Mixed layer depth: ${measurements.mixed_layer_depth?.toFixed(1) || "N/A"}m
    - Thermocline depth: ${measurements.thermocline_depth?.toFixed(1) || "N/A"}m
    - Surface temperature: ${measurements.surface_temperature?.toFixed(1) || "N/A"}°C
    - Surface salinity: ${measurements.surface_salinity?.toFixed(2) || "N/A"} PSU
    - Ocean heat content (0-200m): ${measurements.ocean_heat_content_0_200m ? (measurements.ocean_heat_content_0_200m / 1e8).toFixed(1) + "e8 J/m²" : "N/A"}
    - Mean stratification: ${measurements.mean_stratification?.toFixed(3) || "N/A"} s⁻²
    - Water mass: ${metadata.environmental_context.water_mass_type}
    - Thermal structure: ${metadata.environmental_context.thermal_structure}
    - Features: ${metadata.environmental_context.oceanographic_features?.join(", ")}
    - Profile levels: ${measurements.profile_levels || "N/A"} measurements
    
    This profile represents ${metadata.environmental_context.season.toLowerCase()} conditions during the 
    ${metadata.environmental_context.monsoon_period?.toLowerCase()} monsoon period in the ${metadata.location.region}.
    It can be used to understand thermal structure, mixed layer dynamics, and heat content variations in this region.`
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      })

      return response.data[0].embedding
    } catch (error) {
      console.error("[v0] Failed to generate embedding:", error)
      return Array.from({ length: 1536 }, () => Math.random() - 0.5)
    }
  }

  async addProfiles(profiles: ArgoProfile[]): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("Vector search engine not initialized")
    }

    console.log(`[v0] Processing ${profiles.length} profiles for vector indexing...`)

    for (const profile of profiles) {
      try {
        const textContent = this.extractTextContent(profile)
        const embedding = await this.generateEmbedding(textContent)
        const vectorMetadata = this.createVectorMetadata(profile, textContent)

        const embeddingMetadata: EmbeddingMetadata = {
          ...vectorMetadata,
          vector_id: this.vectorStore.length,
          embedding,
          embedding_model: "text-embedding-3-small",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        this.vectorStore.push(embeddingMetadata)

        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`[v0] Failed to process profile ${profile.id}:`, error)
      }
    }

    console.log(`[v0] Added ${this.vectorStore.length} profiles to vector store`)
  }

  async searchVector(query: string, topK = 10): Promise<VectorSearchResult[]> {
    if (!this.isInitialized) {
      throw new Error("Vector search engine not initialized")
    }

    try {
      const queryEmbedding = await this.generateEmbedding(query)
      const searchResults: VectorSearchResult[] = []

      for (const metadata of this.vectorStore) {
        const similarity = this.cosineSimilarity(queryEmbedding, metadata.embedding)

        // Create profile object with enhanced data
        const profile: ArgoProfile = {
          id: metadata.id,
          file: metadata.file,
          date: metadata.date_collected,
          lat: metadata.location.latitude,
          lon: metadata.location.longitude,
          mld: metadata.measurements.mixed_layer_depth,
          thermoclinedepth: metadata.measurements.thermocline_depth,
          salinitymindepth: metadata.measurements.salinity_min_depth,
          salinitymaxdepth: metadata.measurements.salinity_max_depth,
          meanstratification: metadata.measurements.mean_stratification,
          ohc_0_200m: metadata.measurements.ocean_heat_content_0_200m,
          surfacetemp: metadata.measurements.surface_temperature,
          surfacesal: metadata.measurements.surface_salinity,
          n_levels: metadata.measurements.profile_levels,
          direction: metadata.measurements.direction,
          location_name: metadata.location.name,
          ocean_basin: metadata.location.ocean_basin,
          data_quality: metadata.data_quality.overall_grade,
        }

        // Generate rich RAG context
        const ragContext = this.generateRAGContext(metadata, similarity, query)

        searchResults.push({
          profile,
          similarity,
          metadata,
          rag_context: ragContext,
        })
      }

      return searchResults.sort((a, b) => b.similarity - a.similarity).slice(0, topK)
    } catch (error) {
      console.error("[v0] Vector search failed:", error)
      throw error
    }
  }

  getStats() {
    return {
      isInitialized: this.isInitialized,
      totalProfiles: this.vectorStore.length,
      indexSize: this.vectorStore.length,
    }
  }

  async saveIndex(key = "argo_vector_index"): Promise<void> {
    try {
      const data = {
        vectorStore: this.vectorStore,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(key, JSON.stringify(data))
      console.log(`[v0] Vector index saved to localStorage with key: ${key}`)
    } catch (error) {
      console.error("[v0] Failed to save index:", error)
      throw error
    }
  }

  async loadIndex(key = "argo_vector_index"): Promise<void> {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        this.vectorStore = parsed.vectorStore || []
        this.isInitialized = true
        console.log(`[v0] Vector index loaded from localStorage with ${this.vectorStore.length} profiles`)
      }
    } catch (error) {
      console.error("[v0] Failed to load index:", error)
      throw error
    }
  }
}

let vectorSearchEngine: VectorSearchEngine | null = null

export function getVectorSearchEngine(): VectorSearchEngine {
  if (!vectorSearchEngine) {
    vectorSearchEngine = new VectorSearchEngine()
  }
  return vectorSearchEngine
}

export async function searchVector(query: string, topK = 10): Promise<VectorSearchResult[]> {
  const engine = getVectorSearchEngine()

  if (!engine.getStats().isInitialized) {
    await engine.initialize()
  }

  return engine.searchVector(query, topK)
}

export async function initializeVectorSearch(): Promise<void> {
  const engine = getVectorSearchEngine()

  if (!engine.getStats().isInitialized) {
    await engine.initialize()

    // Try to load existing index first
    try {
      await engine.loadIndex()
      if (engine.getStats().totalProfiles > 0) {
        console.log("[v0] Loaded existing vector index from localStorage")
        return
      }
    } catch (error) {
      console.log("[v0] No existing index found, creating new one")
    }

    // Enhanced sample ARGO profiles with comprehensive metadata
    const sampleProfiles: ArgoProfile[] = [
      {
        id: "argo_001",
        file: "argo_001.nc",
        date: "2024-01-15T12:30:00Z",
        lat: 45.5,
        lon: -30.2,
        mld: 50,
        thermoclinedepth: 100,
        salinitymindepth: 10,
        salinitymaxdepth: 2000,
        meanstratification: 0.025,
        ohc_0_200m: 2.75e8,
        surfacetemp: 28.5,
        surfacesal: 35.1,
        n_levels: 10,
        direction: "eastward",
        location_name: "North Indian Ocean",
        ocean_basin: "Indian Ocean",
        data_quality: "Excellent",
      },
      {
        id: "argo_002",
        file: "argo_002.nc",
        date: "2024-02-16T08:15:00Z",
        lat: -20.1,
        lon: 165.8,
        mld: 35,
        thermoclinedepth: 150,
        salinitymindepth: 50,
        salinitymaxdepth: 1500,
        meanstratification: 0.035,
        ohc_0_200m: 3.25e8,
        surfacetemp: 26.2,
        surfacesal: 34.8,
        n_levels: 8,
        direction: "southward",
        location_name: "South Indian Ocean",
        ocean_basin: "Indian Ocean",
        data_quality: "Good",
      },
      {
        id: "argo_003",
        file: "argo_003.nc",
        date: "2024-03-17T14:45:00Z",
        lat: 60.2,
        lon: 2.5,
        mld: 25,
        thermoclinedepth: 200,
        salinitymindepth: 20,
        salinitymaxdepth: 1000,
        meanstratification: 0.015,
        ohc_0_200m: 2.5e8,
        surfacetemp: 25.2,
        surfacesal: 35.0,
        n_levels: 6,
        direction: "northward",
        location_name: "Indian Ocean Transition Zone",
        ocean_basin: "Indian Ocean",
        data_quality: "Fair",
      },
    ]

    await engine.addProfiles(sampleProfiles)
    await engine.saveIndex()
    console.log("[v0] Vector search initialized with enhanced sample data")
  }
}
