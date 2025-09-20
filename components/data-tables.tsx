"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Search,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  MapPin,
  Calendar,
  Thermometer,
  Droplets,
  Gauge,
  Waves,
} from "lucide-react"

// Mock oceanographic data
const profilesData = [
  {
    id: 1,
    file: "D1901393_001.nc",
    date: "2023-06-15",
    lat: -5.2,
    lon: 67.8,
    mld: 45.5,
    thermoclinedepth: 120.3,
    salinitymindepth: 85.2,
    salinitymaxdepth: 200.1,
    meanstratification: 0.0045,
    ohc_0_200m: 2.8e9,
    surfacetemp: 28.5,
    surfacesal: 35.2,
    n_levels: 156,
    direction: "ascending",
    quality: "excellent",
  },
  {
    id: 2,
    file: "D1901394_002.nc",
    date: "2023-07-20",
    lat: -8.1,
    lon: 72.3,
    mld: 32.8,
    thermoclinedepth: 95.7,
    salinitymindepth: 75.4,
    salinitymaxdepth: 180.6,
    meanstratification: 0.0052,
    ohc_0_200m: 3.1e9,
    surfacetemp: 29.2,
    surfacesal: 34.8,
    n_levels: 142,
    direction: "ascending",
    quality: "good",
  },
  {
    id: 3,
    file: "D1901395_003.nc",
    date: "2023-08-01",
    lat: -12.5,
    lon: 78.9,
    mld: 28.3,
    thermoclinedepth: 85.2,
    salinitymindepth: 65.1,
    salinitymaxdepth: 150.8,
    meanstratification: 0.0058,
    ohc_0_200m: 3.4e9,
    surfacetemp: 30.1,
    surfacesal: 34.5,
    n_levels: 138,
    direction: "ascending",
    quality: "excellent",
  },
  {
    id: 4,
    file: "D1901396_004.nc",
    date: "2023-09-10",
    lat: 8.2,
    lon: 88.1,
    mld: 22.1,
    thermoclinedepth: 78.5,
    salinitymindepth: 58.3,
    salinitymaxdepth: 165.2,
    meanstratification: 0.0061,
    ohc_0_200m: 3.6e9,
    surfacetemp: 29.8,
    surfacesal: 33.9,
    n_levels: 145,
    direction: "ascending",
    quality: "good",
  },
  {
    id: 5,
    file: "D1901397_005.nc",
    date: "2023-10-05",
    lat: 15.7,
    lon: 68.4,
    mld: 38.7,
    thermoclinedepth: 105.8,
    salinitymindepth: 82.1,
    salinitymaxdepth: 195.3,
    meanstratification: 0.0048,
    ohc_0_200m: 3.2e9,
    surfacetemp: 28.9,
    surfacesal: 35.8,
    n_levels: 152,
    direction: "ascending",
    quality: "excellent",
  },
  {
    id: 6,
    file: "D1901398_006.nc",
    date: "2023-11-12",
    lat: 2.1,
    lon: 75.6,
    mld: 41.2,
    thermoclinedepth: 112.4,
    salinitymindepth: 88.7,
    salinitymaxdepth: 205.9,
    meanstratification: 0.0043,
    ohc_0_200m: 2.9e9,
    surfacetemp: 28.1,
    surfacesal: 35.1,
    n_levels: 148,
    direction: "ascending",
    quality: "fair",
  },
]

const measurementsData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  profileId: `ARGO_${String(Math.floor(i / 10) + 1).padStart(3, "0")}`,
  depth: i * 40 + Math.random() * 20,
  temperature: 25 - i * 0.4 + Math.random() * 2,
  salinity: 34.5 + i * 0.01 + Math.random() * 0.5,
  pressure: i * 4 + Math.random() * 2,
  oxygen: 250 - i * 3 + Math.random() * 20,
  ph: 8.1 - i * 0.002 + Math.random() * 0.1,
  timestamp: new Date(
    2024,
    0,
    15 - Math.floor(i / 10),
    Math.floor(Math.random() * 24),
    Math.floor(Math.random() * 60),
  ).toISOString(),
  quality: Math.random() > 0.8 ? "excellent" : Math.random() > 0.5 ? "good" : "fair",
}))

type SortField = keyof (typeof profilesData)[0] | keyof (typeof measurementsData)[0]
type SortDirection = "asc" | "desc"

export default function DataTables() {
  const [searchQuery, setSearchQuery] = useState("")
  const [qualityFilter, setQualityFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const filteredProfiles = useMemo(() => {
    return profilesData.filter((profile) => {
      const matchesSearch =
        profile.id.toString().includes(searchQuery) ||
        profile.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.lat.toString().includes(searchQuery) ||
        profile.lon.toString().includes(searchQuery)

      const matchesQuality = qualityFilter === "all" || profile.quality === qualityFilter

      return matchesSearch && matchesQuality
    })
  }, [searchQuery, qualityFilter])

  const sortedProfiles = useMemo(() => {
    return [...filteredProfiles].sort((a, b) => {
      const aValue = a[sortField as keyof typeof a]
      const bValue = b[sortField as keyof typeof b]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })
  }, [filteredProfiles, sortField, sortDirection])

  const paginatedProfiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedProfiles.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedProfiles, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedProfiles.length / itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === paginatedProfiles.length ? [] : paginatedProfiles.map((profile) => profile.id.toString()),
    )
  }

  const getQualityBadge = (quality: string) => {
    const variants = {
      excellent: "default",
      good: "secondary",
      fair: "outline",
    } as const

    return <Badge variant={variants[quality as keyof typeof variants] || "outline"}>{quality}</Badge>
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field &&
          (sortDirection === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
      </div>
    </Button>
  )

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search profiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
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

        <div className="flex items-center gap-2 ml-auto">
          <Label htmlFor="items-per-page" className="text-sm">
            Show:
          </Label>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-20" id="items-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" disabled={selectedRows.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export ({selectedRows.length})
        </Button>
      </div>

      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Waves className="h-4 w-4" />
            ARGO Profiles
          </TabsTrigger>
          <TabsTrigger value="measurements" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Measurements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>ARGO Profile Data</span>
                <Badge variant="outline">{sortedProfiles.length} profiles</Badge>
              </CardTitle>
              <CardDescription>
                Comprehensive oceanographic profile information with location, depth, and quality metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRows.length === paginatedProfiles.length && paginatedProfiles.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>
                        <SortButton field="id">Profile ID</SortButton>
                      </TableHead>
                      <TableHead>
                        <SortButton field="file">Data File</SortButton>
                      </TableHead>
                      <TableHead>
                        <SortButton field="lat">
                          <MapPin className="h-3 w-3 mr-1" />
                          Location
                        </SortButton>
                      </TableHead>
                      <TableHead>
                        <SortButton field="date">
                          <Calendar className="h-3 w-3 mr-1" />
                          Date
                        </SortButton>
                      </TableHead>
                      <TableHead>
                        <SortButton field="surfacetemp">
                          <Thermometer className="h-3 w-3 mr-1" />
                          Surface T°
                        </SortButton>
                      </TableHead>
                      <TableHead>
                        <SortButton field="surfacesal">
                          <Droplets className="h-3 w-3 mr-1" />
                          Surface Sal
                        </SortButton>
                      </TableHead>
                      <TableHead>
                        <SortButton field="mld">MLD (m)</SortButton>
                      </TableHead>
                      <TableHead>
                        <SortButton field="thermoclinedepth">Thermocline</SortButton>
                      </TableHead>
                      <TableHead>
                        <SortButton field="ohc_0_200m">OHC (0-200m)</SortButton>
                      </TableHead>
                      <TableHead>
                        <SortButton field="quality">Quality</SortButton>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(profile.id.toString())}
                            onCheckedChange={() => handleSelectRow(profile.id.toString())}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{profile.id}</TableCell>
                        <TableCell className="font-mono text-xs">{profile.file}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>
                              {profile.lat.toFixed(2)}°{profile.lat >= 0 ? "N" : "S"}
                            </div>
                            <div className="text-muted-foreground">{profile.lon.toFixed(2)}°E</div>
                          </div>
                        </TableCell>
                        <TableCell>{profile.date}</TableCell>
                        <TableCell>
                          <span className="font-medium text-chart-1">{profile.surfacetemp}°C</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-chart-2">{profile.surfacesal} PSU</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-blue-600">{profile.mld.toFixed(1)}m</span>
                        </TableCell>
                        <TableCell>{profile.thermoclinedepth.toFixed(1)}m</TableCell>
                        <TableCell>
                          <span className="font-medium text-orange-600">
                            {(profile.ohc_0_200m / 1e9).toFixed(1)} GJ/m²
                          </span>
                        </TableCell>
                        <TableCell>{getQualityBadge(profile.quality)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, sortedProfiles.length)} of {sortedProfiles.length} profiles
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Measurement Data</span>
                <Badge variant="outline">{measurementsData.length} measurements</Badge>
              </CardTitle>
              <CardDescription>
                Individual sensor measurements with depth, temperature, salinity, and other parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Depth (m)</TableHead>
                      <TableHead>Temperature (°C)</TableHead>
                      <TableHead>Salinity (PSU)</TableHead>
                      <TableHead>Pressure (dbar)</TableHead>
                      <TableHead>Oxygen (μmol/kg)</TableHead>
                      <TableHead>pH</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measurementsData.slice(0, 10).map((measurement) => (
                      <TableRow key={measurement.id}>
                        <TableCell className="font-medium">{measurement.id}</TableCell>
                        <TableCell>{measurement.profileId}</TableCell>
                        <TableCell>{measurement.depth.toFixed(1)}</TableCell>
                        <TableCell>
                          <span className="font-medium text-chart-1">{measurement.temperature.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-chart-2">{measurement.salinity.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>{measurement.pressure.toFixed(1)}</TableCell>
                        <TableCell>
                          <span className="font-medium text-chart-3">{measurement.oxygen.toFixed(1)}</span>
                        </TableCell>
                        <TableCell>{measurement.ph.toFixed(2)}</TableCell>
                        <TableCell>{getQualityBadge(measurement.quality)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(measurement.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
