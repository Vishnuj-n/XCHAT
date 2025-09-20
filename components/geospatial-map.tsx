"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { MapPin, Layers, Filter, Download, Maximize2 } from "lucide-react"

// Mock ARGO profile data
const mockArgoData = [
  { id: 1, lat: 35.2, lon: -75.1, temp: 18.5, salinity: 35.2, depth: 2000, date: "2024-01-15", quality: "good" },
  { id: 2, lat: 40.7, lon: -70.3, temp: 15.2, salinity: 34.8, depth: 1800, date: "2024-01-14", quality: "excellent" },
  { id: 3, lat: 32.1, lon: -64.8, temp: 22.1, salinity: 36.1, depth: 2200, date: "2024-01-13", quality: "good" },
  { id: 4, lat: 38.9, lon: -76.5, temp: 16.8, salinity: 35.0, depth: 1950, date: "2024-01-12", quality: "fair" },
  { id: 5, lat: 41.5, lon: -69.2, temp: 14.3, salinity: 34.5, depth: 1750, date: "2024-01-11", quality: "excellent" },
  { id: 6, lat: 36.8, lon: -73.2, temp: 19.2, salinity: 35.5, depth: 2100, date: "2024-01-10", quality: "good" },
  { id: 7, lat: 33.7, lon: -67.1, temp: 21.5, salinity: 35.8, depth: 2300, date: "2024-01-09", quality: "good" },
  { id: 8, lat: 39.3, lon: -72.4, temp: 17.1, salinity: 34.9, depth: 1900, date: "2024-01-08", quality: "excellent" },
]

interface GeospatialMapProps {
  className?: string
}

export default function GeospatialMap({ className }: GeospatialMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedProfile, setSelectedProfile] = useState<(typeof mockArgoData)[0] | null>(null)
  const [mapLayer, setMapLayer] = useState("satellite")
  const [depthRange, setDepthRange] = useState([0, 3000])
  const [qualityFilter, setQualityFilter] = useState("all")

  // Simulate map initialization
  useEffect(() => {
    if (mapRef.current) {
      // In a real implementation, this would initialize Leaflet map
      console.log("Initializing Leaflet map...")
    }
  }, [])

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "bg-green-500"
      case "good":
        return "bg-blue-500"
      case "fair":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredData = mockArgoData.filter((profile) => {
    const depthInRange = profile.depth >= depthRange[0] && profile.depth <= depthRange[1]
    const qualityMatch = qualityFilter === "all" || profile.quality === qualityFilter
    return depthInRange && qualityMatch
  })

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <Select value={mapLayer} onValueChange={setMapLayer}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="satellite">Satellite</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
              <SelectItem value="ocean">Ocean</SelectItem>
              <SelectItem value="bathymetry">Bathymetry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={qualityFilter} onValueChange={setQualityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quality</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 min-w-48">
          <span className="text-sm text-muted-foreground">Depth:</span>
          <Slider value={depthRange} onValueChange={setDepthRange} max={3000} min={0} step={100} className="flex-1" />
          <span className="text-sm text-muted-foreground">
            {depthRange[0]}-{depthRange[1]}m
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                ARGO Profile Locations
              </CardTitle>
              <CardDescription>Interactive map showing {filteredData.length} active profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                ref={mapRef}
                className="h-96 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-slate-900 rounded-lg relative overflow-hidden"
              >
                {/* Simulated map with profile markers */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-green-400/20">
                  {filteredData.map((profile) => (
                    <div
                      key={profile.id}
                      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${((profile.lon + 180) / 360) * 100}%`,
                        top: `${((90 - profile.lat) / 180) * 100}%`,
                      }}
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${getQualityColor(profile.quality)} border-2 border-white shadow-lg hover:scale-125 transition-transform`}
                      />
                    </div>
                  ))}
                </div>

                {/* Map overlay info */}
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 rounded-lg p-3 shadow-lg">
                  <div className="text-sm font-medium">Active Profiles: {filteredData.length}</div>
                  <div className="text-xs text-muted-foreground">Click markers for details</div>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/90 rounded-lg p-3 shadow-lg">
                  <div className="text-xs font-medium mb-2">Data Quality</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs">Excellent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs">Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-xs">Fair</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details Panel */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Profile Details</CardTitle>
              <CardDescription>
                {selectedProfile ? `Profile #${selectedProfile.id}` : "Select a profile on the map"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProfile ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Location</div>
                    <div className="text-sm">
                      {selectedProfile.lat.toFixed(2)}°N, {Math.abs(selectedProfile.lon).toFixed(2)}°W
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Temperature</div>
                    <div className="text-lg font-semibold text-chart-1">{selectedProfile.temp}°C</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Salinity</div>
                    <div className="text-lg font-semibold text-chart-2">{selectedProfile.salinity} PSU</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Max Depth</div>
                    <div className="text-lg font-semibold text-chart-3">{selectedProfile.depth}m</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Date</div>
                    <div className="text-sm">{selectedProfile.date}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Quality</div>
                    <Badge variant={selectedProfile.quality === "excellent" ? "default" : "secondary"}>
                      {selectedProfile.quality}
                    </Badge>
                  </div>

                  <Button className="w-full mt-4" size="sm">
                    View Full Profile
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Click on a profile marker to view detailed information</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
