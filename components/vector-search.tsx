"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Calendar, Waves, Thermometer, Droplets } from "lucide-react"
import { searchVector, type VectorSearchResult, initializeVectorSearch } from "@/lib/vector-search"

export default function VectorSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<VectorSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const handleInitialize = async () => {
    setIsLoading(true)
    try {
      await initializeVectorSearch()
      setIsInitialized(true)
      console.log("[v0] Vector search system initialized")
    } catch (error) {
      console.error("[v0] Failed to initialize vector search:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const searchResults = await searchVector(query, 5)
      setResults(searchResults)
      console.log("[v0] Vector search completed:", searchResults.length, "results")
    } catch (error) {
      console.error("[v0] Vector search failed:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Vector Search
          </CardTitle>
          <CardDescription>
            Search Indian Ocean ARGO profiles using natural language queries powered by AI embeddings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isInitialized ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Initialize the vector search system to start searching</p>
              <Button onClick={handleInitialize} disabled={isLoading}>
                {isLoading ? "Initializing..." : "Initialize Vector Search"}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  placeholder="Search for profiles... (e.g., 'deep mixed layer during monsoon', 'high heat content profiles', 'Bay of Bengal salinity patterns')"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Try queries like:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>"Deep mixed layer profiles during SW monsoon"</li>
                  <li>"High ocean heat content in Arabian Sea"</li>
                  <li>"Shallow thermocline in Bay of Bengal"</li>
                  <li>"Strong stratification during inter-monsoon"</li>
                  <li>"Salinity minimum zones in equatorial Indian Ocean"</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>Found {results.length} similar profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={result.metadata.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Profile {result.metadata.id}</Badge>
                      <Badge
                        variant={result.metadata.data_quality?.overall_grade === "Excellent" ? "default" : "secondary"}
                      >
                        {result.metadata.data_quality?.overall_grade || "Good"}
                      </Badge>
                      <Badge variant="outline">{result.metadata.environmental_context?.season || "Unknown"}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Similarity: {(result.similarity * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {result.metadata.location?.name ||
                          `${result.metadata.location?.latitude?.toFixed(2) || "N/A"}°, ${result.metadata.location?.longitude?.toFixed(2) || "N/A"}°`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {result.metadata.timestamp ? new Date(result.metadata.timestamp).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Waves className="h-4 w-4 text-muted-foreground" />
                      <span>MLD: {result.metadata.variables?.mld?.toFixed(1) || "N/A"}m</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span>Surface Temp: {result.metadata.variables?.surfacetemp?.toFixed(1) || "N/A"}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      <span>Surface Sal: {result.metadata.variables?.surfacesal?.toFixed(2) || "N/A"} PSU</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-medium text-blue-600">
                        {result.metadata.variables?.thermoclinedepth?.toFixed(0) || "N/A"}m
                      </div>
                      <div className="text-xs text-muted-foreground">Thermocline Depth</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-medium text-orange-600">
                        {result.metadata.variables?.ohc_0_200m
                          ? (result.metadata.variables.ohc_0_200m / 1e9).toFixed(1)
                          : "N/A"}{" "}
                        GJ/m²
                      </div>
                      <div className="text-xs text-muted-foreground">Ocean Heat Content</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-medium text-green-600">
                        {result.metadata.variables?.meanstratification?.toFixed(4) || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">Stratification Index</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {(result.metadata.search_tags || ["indian_ocean", "monsoon", "thermal_structure"])
                        .slice(0, 5)
                        .map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag.replace(/_/g, " ")}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="mb-3 p-3 bg-muted/30 rounded text-sm">
                    <p className="font-medium mb-1">RAG Context:</p>
                    <p className="text-muted-foreground line-clamp-3">{result.rag_context}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      Show on Map
                    </Button>
                    <Button variant="outline" size="sm">
                      Export Data
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
