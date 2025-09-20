"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"
import { TrendingUp, Activity, Thermometer, Droplets, Layers, Calendar, Filter } from "lucide-react"

// Mock oceanographic data
const temperatureData = [
  { month: "Jan", surface: 18.2, depth100: 16.8, depth500: 12.4, depth1000: 8.2, depth2000: 4.1 },
  { month: "Feb", surface: 18.5, depth100: 17.1, depth500: 12.7, depth1000: 8.4, depth2000: 4.2 },
  { month: "Mar", surface: 19.8, depth100: 18.2, depth500: 13.5, depth1000: 9.1, depth2000: 4.5 },
  { month: "Apr", surface: 21.2, depth100: 19.5, depth500: 14.8, depth1000: 10.2, depth2000: 5.1 },
  { month: "May", surface: 23.1, depth100: 21.3, depth500: 16.2, depth1000: 11.8, depth2000: 5.8 },
  { month: "Jun", surface: 25.4, depth100: 23.8, depth500: 18.1, depth1000: 13.5, depth2000: 6.5 },
  { month: "Jul", surface: 26.8, depth100: 25.2, depth500: 19.4, depth1000: 14.8, depth2000: 7.2 },
  { month: "Aug", surface: 26.5, depth100: 24.9, depth500: 19.1, depth1000: 14.5, depth2000: 7.0 },
  { month: "Sep", surface: 24.8, depth100: 23.1, depth500: 17.8, depth1000: 13.2, depth2000: 6.3 },
  { month: "Oct", surface: 22.3, depth100: 20.6, depth500: 15.9, depth1000: 11.4, depth2000: 5.5 },
  { month: "Nov", surface: 20.1, depth100: 18.8, depth500: 14.2, depth1000: 9.8, depth2000: 4.8 },
  { month: "Dec", surface: 18.7, depth100: 17.4, depth500: 13.1, depth1000: 8.9, depth2000: 4.3 },
]

const salinityData = [
  { month: "Jan", surface: 35.1, depth100: 35.3, depth500: 35.8, depth1000: 34.9, depth2000: 34.7 },
  { month: "Feb", surface: 35.2, depth100: 35.4, depth500: 35.9, depth1000: 35.0, depth2000: 34.8 },
  { month: "Mar", surface: 35.0, depth100: 35.2, depth500: 35.7, depth1000: 34.8, depth2000: 34.6 },
  { month: "Apr", surface: 34.9, depth100: 35.1, depth500: 35.6, depth1000: 34.7, depth2000: 34.5 },
  { month: "May", surface: 34.8, depth100: 35.0, depth500: 35.5, depth1000: 34.6, depth2000: 34.4 },
  { month: "Jun", surface: 34.7, depth100: 34.9, depth500: 35.4, depth1000: 34.5, depth2000: 34.3 },
  { month: "Jul", surface: 34.6, depth100: 34.8, depth500: 35.3, depth1000: 34.4, depth2000: 34.2 },
  { month: "Aug", surface: 34.7, depth100: 34.9, depth500: 35.4, depth1000: 34.5, depth2000: 34.3 },
  { month: "Sep", surface: 34.8, depth100: 35.0, depth500: 35.5, depth1000: 34.6, depth2000: 34.4 },
  { month: "Oct", surface: 34.9, depth100: 35.1, depth500: 35.6, depth1000: 34.7, depth2000: 34.5 },
  { month: "Nov", surface: 35.0, depth100: 35.2, depth500: 35.7, depth1000: 34.8, depth2000: 34.6 },
  { month: "Dec", surface: 35.1, depth100: 35.3, depth500: 35.8, depth1000: 34.9, depth2000: 34.7 },
]

const profileDistribution = [
  { depth: "0-100m", count: 2847, percentage: 22.1 },
  { depth: "100-500m", count: 3521, percentage: 27.4 },
  { depth: "500-1000m", count: 2934, percentage: 22.8 },
  { depth: "1000-2000m", count: 2156, percentage: 16.8 },
  { depth: "2000m+", count: 1389, percentage: 10.8 },
]

const qualityMetrics = [
  { parameter: "Temperature", excellent: 85, good: 12, fair: 3 },
  { parameter: "Salinity", excellent: 78, good: 18, fair: 4 },
  { parameter: "Pressure", excellent: 92, good: 7, fair: 1 },
  { parameter: "Oxygen", excellent: 71, good: 24, fair: 5 },
  { parameter: "pH", excellent: 68, good: 27, fair: 5 },
]

const scatterData = Array.from({ length: 100 }, (_, i) => ({
  temperature: 15 + Math.random() * 15,
  salinity: 34 + Math.random() * 2,
  depth: Math.random() * 3000,
  quality: Math.random() > 0.7 ? "excellent" : Math.random() > 0.4 ? "good" : "fair",
}))

const chartConfig = {
  surface: { label: "Surface", color: "var(--chart-1)" },
  depth100: { label: "100m", color: "var(--chart-2)" },
  depth500: { label: "500m", color: "var(--chart-3)" },
  depth1000: { label: "1000m", color: "var(--chart-4)" },
  depth2000: { label: "2000m", color: "var(--chart-5)" },
  excellent: { label: "Excellent", color: "var(--chart-1)" },
  good: { label: "Good", color: "var(--chart-2)" },
  fair: { label: "Fair", color: "var(--chart-3)" },
}

export default function DataCharts() {
  const [selectedRegion, setSelectedRegion] = useState("global")
  const [timeRange, setTimeRange] = useState("12months")

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="atlantic">Atlantic</SelectItem>
              <SelectItem value="pacific">Pacific</SelectItem>
              <SelectItem value="indian">Indian Ocean</SelectItem>
              <SelectItem value="arctic">Arctic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">12 Months</SelectItem>
              <SelectItem value="5years">5 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Trending Up
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Real-time
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="temperature" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="temperature" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Temperature
          </TabsTrigger>
          <TabsTrigger value="salinity" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Salinity
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Quality
          </TabsTrigger>
        </TabsList>

        <TabsContent value="temperature" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-chart-1" />
                  Temperature by Depth
                </CardTitle>
                <CardDescription>Monthly temperature variations across depth layers</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <LineChart data={temperatureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="surface" stroke="var(--color-surface)" strokeWidth={3} />
                    <Line type="monotone" dataKey="depth100" stroke="var(--color-depth100)" strokeWidth={2} />
                    <Line type="monotone" dataKey="depth500" stroke="var(--color-depth500)" strokeWidth={2} />
                    <Line type="monotone" dataKey="depth1000" stroke="var(--color-depth1000)" strokeWidth={2} />
                    <Line type="monotone" dataKey="depth2000" stroke="var(--color-depth2000)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temperature Gradient</CardTitle>
                <CardDescription>Depth-temperature relationship visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <AreaChart data={temperatureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="surface"
                      stackId="1"
                      stroke="var(--color-surface)"
                      fill="var(--color-surface)"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="depth100"
                      stackId="2"
                      stroke="var(--color-depth100)"
                      fill="var(--color-depth100)"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="depth500"
                      stackId="3"
                      stroke="var(--color-depth500)"
                      fill="var(--color-depth500)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="salinity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-chart-2" />
                  Salinity Profiles
                </CardTitle>
                <CardDescription>Salinity measurements across different depths</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <LineChart data={salinityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[34, 36]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="surface" stroke="var(--color-surface)" strokeWidth={3} />
                    <Line type="monotone" dataKey="depth100" stroke="var(--color-depth100)" strokeWidth={2} />
                    <Line type="monotone" dataKey="depth500" stroke="var(--color-depth500)" strokeWidth={2} />
                    <Line type="monotone" dataKey="depth1000" stroke="var(--color-depth1000)" strokeWidth={2} />
                    <Line type="monotone" dataKey="depth2000" stroke="var(--color-depth2000)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temperature vs Salinity</CardTitle>
                <CardDescription>Scatter plot showing T-S relationship</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <ScatterChart data={scatterData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="temperature" name="Temperature" unit="°C" />
                    <YAxis dataKey="salinity" name="Salinity" unit="PSU" domain={[34, 36]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Scatter dataKey="salinity" fill="var(--color-depth100)" />
                  </ScatterChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-chart-3" />
                  Profile Distribution by Depth
                </CardTitle>
                <CardDescription>Number of profiles across depth ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <BarChart data={profileDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="depth" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-depth100)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Depth Coverage Percentage</CardTitle>
                <CardDescription>Relative distribution of measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <BarChart data={profileDistribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="depth" type="category" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="percentage" fill="var(--color-depth500)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-chart-4" />
                  Data Quality by Parameter
                </CardTitle>
                <CardDescription>Quality control results across measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <BarChart data={qualityMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="parameter" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="excellent" stackId="a" fill="var(--color-excellent)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="good" stackId="a" fill="var(--color-good)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="fair" stackId="a" fill="var(--color-fair)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Trends</CardTitle>
                <CardDescription>Data quality improvements over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {qualityMetrics.map((metric) => (
                    <div key={metric.parameter} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{metric.parameter}</span>
                        <span className="text-muted-foreground">{metric.excellent}% excellent</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-chart-1 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${metric.excellent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
