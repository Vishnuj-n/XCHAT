"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, BarChart3, Waves, Search, Settings, Download, Globe, TrendingUp, Database } from "lucide-react"
import GeospatialMap from "@/components/geospatial-map"
import DataCharts from "@/components/data-charts"
import ProfileAnalysis from "@/components/profile-analysis"
import DataTables from "@/components/data-tables"
import OceanographicChatbot from "@/components/oceanographic-chatbot"
import VectorSearch from "@/components/vector-search"
import Link from "next/link"

export default function OceanographicDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  const handleChatbotShowMap = (filters: any) => {
    setActiveTab("geospatial")
    console.log("[v0] Chatbot requested map view with filters:", filters)
  }

  const handleChatbotShowChart = (chartType: string, data: any) => {
    setActiveTab("analysis")
    console.log("[v0] Chatbot requested chart:", chartType, data)
  }

  const handleChatbotShowTable = (tableType: string, filters: any) => {
    setActiveTab("data")
    console.log("[v0] Chatbot requested table view:", tableType, filters)
  }

  const handleChatbotExportData = (dataType: string, filters: any) => {
    console.log("[v0] Chatbot requested data export:", dataType, filters)
    alert(`Exporting ${dataType} data with applied filters...`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Waves className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Float Chat</h1>
              </div>
              <Badge variant="secondary" className="ml-2">
                ARGO Data Platform
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search profiles, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Link href="/workflow">
                <Button variant="outline" size="icon">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </Button>
              </Link>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">12,847</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ocean Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">89.3%</div>
              <p className="text-xs text-muted-foreground">Global ocean basins</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Depth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "var(--chart-3)" }}>
                2,847m
              </div>
              <p className="text-xs text-muted-foreground">Mean profile depth</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "var(--chart-4)" }}>
                96.7%
              </div>
              <p className="text-xs text-muted-foreground">QC passed profiles</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="geospatial" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Geospatial
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Profiles
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Waves className="h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Tables
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Vector Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Global Distribution
                  </CardTitle>
                  <CardDescription>ARGO float locations and recent profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Interactive map will be loaded here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-secondary" />
                    Profile Metrics
                  </CardTitle>
                  <CardDescription>Temperature and salinity trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Charts will be loaded here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geospatial">
            <GeospatialMap />
          </TabsContent>

          <TabsContent value="profiles">
            <ProfileAnalysis />
          </TabsContent>

          <TabsContent value="analysis">
            <DataCharts />
          </TabsContent>

          <TabsContent value="data">
            <DataTables />
          </TabsContent>

          <TabsContent value="search">
            <VectorSearch />
          </TabsContent>
        </Tabs>
      </main>

      <OceanographicChatbot
        onShowMap={handleChatbotShowMap}
        onShowChart={handleChatbotShowChart}
        onShowTable={handleChatbotShowTable}
        onExportData={handleChatbotExportData}
      />
    </div>
  )
}
