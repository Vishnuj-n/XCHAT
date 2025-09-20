"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { MapPin, Layers, Compass as Compare, Download, Play, Pause, RotateCcw, Zap } from "lucide-react"

// Mock Indian Ocean ARGO profile data
const profileData = [
  { id: 1, file: "D1901393_001.nc", lat: -5.2, lon: 67.8, date: "2023-06-15", cycles: 45 },
  { id: 2, file: "D1901394_002.nc", lat: -8.1, lon: 72.3, date: "2023-07-20", cycles: 38 },
  { id: 3, file: "D1901395_003.nc", lat: -12.5, lon: 78.9, date: "2023-08-01", cycles: 52 },
  { id: 4, file: "D1901396_004.nc", lat: 8.2, lon: 88.1, date: "2023-09-10", cycles: 41 },
]

// Mock depth-time data with Indian Ocean characteristics
const depthTimeData = Array.from({ length: 50 }, (_, i) => ({
  depth: i * 40,
  temperature: 29 - i * 0.5 + Math.random() * 1.5, // Warmer surface temps
  salinity: 34.2 + i * 0.015 + Math.random() * 0.4, // Indian Ocean salinity range
  oxygen: 220 - i * 2.5 + Math.random() * 15,
  pressure: i * 4,
  mld: i === 0 ? 35 + Math.random() * 20 : null, // Mixed layer depth
  thermoclinedepth: i === 0 ? 95 + Math.random() * 30 : null,
}))

// Mock trajectory data for Indian Ocean
const trajectoryData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  lat: -5.2 + Math.sin(i * 0.2) * 3 + Math.random() * 0.8,
  lon: 67.8 + Math.cos(i * 0.15) * 4 + Math.random() * 0.8,
  depth: Math.abs(Math.sin(i * 0.3)) * 2000,
  temp: 28 + Math.sin(i * 0.1) * 3 + Math.random() * 1.5,
  mld: 25 + Math.sin(i * 0.4) * 15 + Math.random() * 10,
}))

// Mock comparison data for multiple profiles
const comparisonData = Array.from({ length: 40 }, (_, i) => ({
  depth: i * 50,
  profile1_temp: 29 - i * 0.55 + Math.random() * 1,
  profile2_temp: 28.5 - i * 0.5 + Math.random() * 1,
  profile3_temp: 29.5 - i * 0.6 + Math.random() * 1,
  profile1_sal: 34.2 + i * 0.018 + Math.random() * 0.3,
  profile2_sal: 34.0 + i * 0.016 + Math.random() * 0.3,
  profile3_sal: 34.4 + i * 0.02 + Math.random() * 0.3,
}))

const chartConfig = {
  temperature: { label: "Temperature", color: "var(--chart-1)" },
  salinity: { label: "Salinity", color: "var(--chart-2)" },
  oxygen: { label: "Oxygen", color: "var(--chart-3)" },
  pressure: { label: "Pressure", color: "var(--chart-4)" },
  mld: { label: "Mixed Layer Depth", color: "var(--chart-5)" },
  profile1_temp: { label: "Profile 1", color: "var(--chart-1)" },
  profile2_temp: { label: "Profile 2", color: "var(--chart-2)" },
  profile3_temp: { label: "Profile 3", color: "var(--chart-3)" },
  profile1_sal: { label: "Profile 1", color: "var(--chart-1)" },
  profile2_sal: { label: "Profile 2", color: "var(--chart-2)" },
  profile3_sal: { label: "Profile 3", color: "var(--chart-3)" },
}

export default function ProfileAnalysis() {
  const [selectedProfile, setSelectedProfile] = useState("1")
  const [selectedParameter, setSelectedParameter] = useState("temperature")
  const [comparisonProfiles, setComparisonProfiles] = useState(["1", "2"])
  const [isAnimating, setIsAnimating] = useState(false)

  return (
    <div className="space-y-6">
      {/* Profile Selection Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <Label htmlFor="profile-select">Profile:</Label>
          <Select value={selectedProfile} onValueChange={setSelectedProfile}>
            <SelectTrigger className="w-40" id="profile-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {profileData.map((profile) => (
                <SelectItem key={profile.id} value={profile.id.toString()}>
                  Profile {profile.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="parameter-select">Parameter:</Label>
          <Select value={selectedParameter} onValueChange={setSelectedParameter}>
            <SelectTrigger className="w-32" id="parameter-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="salinity">Salinity</SelectItem>
              <SelectItem value="oxygen">Oxygen</SelectItem>
              <SelectItem value="pressure">Pressure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => setIsAnimating(!isAnimating)}>
            {isAnimating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isAnimating ? "Pause" : "Animate"}
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="depth-time" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="depth-time" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Depth-Time
          </TabsTrigger>
          <TabsTrigger value="trajectory" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Trajectory
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Compare className="h-4 w-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="depth-time" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-chart-1" />
                    Depth Profile - Profile {selectedProfile}
                  </CardTitle>
                  <CardDescription>Vertical distribution of {selectedParameter} measurements</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-96">
                    <LineChart data={depthTimeData} margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={selectedParameter} type="number" domain={["dataMin", "dataMax"]} />
                      <YAxis
                        dataKey="depth"
                        type="number"
                        reversed
                        domain={[0, 2000]}
                        label={{ value: "Depth (m)", angle: -90, position: "insideLeft" }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey={selectedParameter}
                        stroke={`var(--color-${selectedParameter})`}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Profile ID</div>
                    <div className="text-lg font-semibold">Profile {selectedProfile}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Location</div>
                    <div className="text-sm">5.2°S, 67.8°E</div>
                    <div className="text-xs text-muted-foreground">Central Indian Ocean</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Max Depth</div>
                    <div className="text-lg font-semibold text-chart-4">2,000m</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Measurements</div>
                    <div className="text-lg font-semibold text-chart-2">156</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Date Range</div>
                    <div className="text-sm">Jun 15 - Aug 20, 2023</div>
                  </div>

                  <Badge variant="outline" className="w-full justify-center">
                    Quality: Excellent
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Indian Ocean Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Surface Temp</span>
                    <span className="font-medium">28.5°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Surface Sal</span>
                    <span className="font-medium">35.2 PSU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mixed Layer Depth</span>
                    <span className="font-medium text-blue-600">45.5m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Thermocline Depth</span>
                    <span className="font-medium">120.3m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">OHC (0-200m)</span>
                    <span className="font-medium text-orange-600">2.8 GJ/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Stratification</span>
                    <span className="font-medium">0.0045</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trajectory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-chart-2" />
                    Float Trajectory - Profile {selectedProfile}
                  </CardTitle>
                  <CardDescription>30-day movement pattern in Indian Ocean</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-96">
                    <ScatterChart data={trajectoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="lon"
                        type="number"
                        domain={["dataMin - 0.5", "dataMax + 0.5"]}
                        label={{ value: "Longitude (°E)", position: "insideBottom", offset: -10 }}
                      />
                      <YAxis
                        dataKey="lat"
                        type="number"
                        domain={["dataMin - 0.5", "dataMax + 0.5"]}
                        label={{ value: "Latitude (°S)", angle: -90, position: "insideLeft" }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Scatter
                        dataKey="lat"
                        fill="var(--color-temperature)"
                        stroke="var(--color-salinity)"
                        strokeWidth={2}
                      />
                    </ScatterChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trajectory Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Distance</div>
                    <div className="text-lg font-semibold text-chart-1">1,247 km</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Avg Speed</div>
                    <div className="text-lg font-semibold text-chart-2">1.8 km/day</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Direction</div>
                    <div className="text-lg font-semibold text-chart-3">NE (52°)</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Cycles</div>
                    <div className="text-lg font-semibold text-chart-4">15</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Current System</div>
                    <div className="text-sm">South Equatorial Current</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mixed Layer Cycles</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-48">
                    <AreaChart data={trajectoryData.slice(0, 15)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="mld"
                        stroke="var(--color-mld)"
                        fill="var(--color-mld)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-muted rounded-lg">
            <Label>Compare Profiles:</Label>
            {profileData.slice(0, 3).map((profile) => (
              <div key={profile.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={profile.id.toString()}
                  checked={comparisonProfiles.includes(profile.id.toString())}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setComparisonProfiles([...comparisonProfiles, profile.id.toString()])
                    } else {
                      setComparisonProfiles(comparisonProfiles.filter((p) => p !== profile.id.toString()))
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor={profile.id.toString()} className="text-sm">
                  Profile {profile.id}
                </Label>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compare className="h-5 w-5 text-chart-1" />
                  Temperature Comparison
                </CardTitle>
                <CardDescription>Temperature profiles across selected floats</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="profile1_temp" type="number" />
                    <YAxis dataKey="depth" type="number" reversed />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profile1_temp"
                      stroke="var(--color-profile1_temp)"
                      strokeWidth={2}
                      name="Profile 1"
                    />
                    <Line
                      type="monotone"
                      dataKey="profile2_temp"
                      stroke="var(--color-profile2_temp)"
                      strokeWidth={2}
                      name="Profile 2"
                    />
                    <Line
                      type="monotone"
                      dataKey="profile3_temp"
                      stroke="var(--color-profile3_temp)"
                      strokeWidth={2}
                      name="Profile 3"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Salinity Comparison</CardTitle>
                <CardDescription>Salinity profiles across selected floats</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="profile1_sal" type="number" domain={[33, 36]} />
                    <YAxis dataKey="depth" type="number" reversed />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profile1_sal"
                      stroke="var(--color-profile1_sal)"
                      strokeWidth={2}
                      name="Profile 1"
                    />
                    <Line
                      type="monotone"
                      dataKey="profile2_sal"
                      stroke="var(--color-profile2_sal)"
                      strokeWidth={2}
                      name="Profile 2"
                    />
                    <Line
                      type="monotone"
                      dataKey="profile3_sal"
                      stroke="var(--color-profile3_sal)"
                      strokeWidth={2}
                      name="Profile 3"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-chart-4" />
                  Indian Ocean Analysis
                </CardTitle>
                <CardDescription>Advanced metrics and monsoon correlations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-chart-1">0.92</div>
                    <div className="text-sm text-muted-foreground">T-S Correlation</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-chart-2">45.5m</div>
                    <div className="text-sm text-muted-foreground">Mixed Layer</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-chart-3">2.1°C</div>
                    <div className="text-sm text-muted-foreground">Temp Std Dev</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-chart-4">97%</div>
                    <div className="text-sm text-muted-foreground">Data Quality</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Stratification Index</span>
                    <span className="font-medium">Moderate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Water Mass</span>
                    <span className="font-medium">Indian Ocean Central Water</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Season</span>
                    <span className="font-medium">SW Monsoon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Ocean Heat Content</span>
                    <span className="font-medium">High</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monsoon Impact Analysis</CardTitle>
                <CardDescription>Seasonal patterns and anomalies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">Mixed Layer Depth</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Typical for SW monsoon</div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Normal
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div>
                      <div className="font-medium text-blue-800 dark:text-blue-200">Ocean Heat Content</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Above average for season</div>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      High
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">Thermocline Structure</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Well-defined seasonal pattern</div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Normal
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div>
                      <div className="font-medium text-yellow-800 dark:text-yellow-200">Salinity Gradient</div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">Weaker than climatology</div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Anomaly
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
