export interface ARGOProfile {
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
  monsoon_period?: string
  thermal_structure?: string
}

export interface ARGOQueryResult {
  data: ARGOProfile[]
  metadata: {
    total_count: number
    page: number
    page_size: number
    has_next: boolean
    query_time: string
    source: string
  }
}

export interface VectorSearchResult {
  profiles: ARGOProfile[]
  similarities: number[]
  metadata: {
    query: string
    total_results: number
    search_time: string
    source: string
  }
}

export interface MCPToolResponse {
  success: boolean
  data?: any
  error?: string
  metadata: {
    timestamp: string
    source: string
    execution_time: number
  }
}

export interface IndianOceanAnalysis {
  monsoon_classification: string
  thermal_structure: string
  water_mass_type: string
  heat_content_category: string
  stratification_level: string
}

export interface EnhancedARGOProfile extends ARGOProfile {
  analysis: IndianOceanAnalysis
  search_tags: string[]
  rag_context: string
}
