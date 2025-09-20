"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Database,
  Search,
  BarChart3,
  Globe,
  Download,
  Waves,
  ArrowLeft,
  Zap,
  Brain,
  Network,
  Settings,
  Play,
} from "lucide-react"
import Link from "next/link"

export default function WorkflowPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Waves className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Float Chat</h1>
              </div>
              <Badge variant="secondary" className="ml-2">
                System Architecture
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Float Chat System Architecture
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete workflow from Indian Ocean ARGO data ingestion to intelligent chat responses using RAG pipeline and
            vector search
          </p>
        </div>

        {/* Detailed System Architecture Diagram */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-6 w-6 text-primary" />
              Detailed System Architecture
            </CardTitle>
            <CardDescription>Complete data flow from client request to intelligent response generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-8 overflow-x-auto">
              <svg viewBox="0 0 1200 800" className="w-full h-auto min-w-[1000px]">
                {/* Client System */}
                <g>
                  <rect x="50" y="50" width="120" height="80" rx="8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                  <text x="110" y="75" textAnchor="middle" className="text-sm font-semibold fill-blue-700">
                    Client System
                  </text>
                  <circle cx="85" cy="95" r="8" fill="#0284c7" />
                  <circle cx="110" cy="95" r="8" fill="#0284c7" />
                  <circle cx="135" cy="95" r="8" fill="#0284c7" />
                  <text x="110" y="120" textAnchor="middle" className="text-xs fill-blue-600">
                    Browser/Mobile
                  </text>
                </g>

                {/* Authentication */}
                <g>
                  <circle cx="110" cy="200" r="25" fill="#fecaca" stroke="#dc2626" strokeWidth="2" />
                  <text x="110" y="205" textAnchor="middle" className="text-xs font-semibold fill-red-700">
                    Auth
                  </text>
                  <text x="110" y="235" textAnchor="middle" className="text-xs fill-red-600">
                    Authentication
                  </text>
                </g>

                {/* Web Application */}
                <g>
                  <rect
                    x="250"
                    y="150"
                    width="140"
                    height="100"
                    rx="8"
                    fill="#dcfce7"
                    stroke="#16a34a"
                    strokeWidth="2"
                  />
                  <text x="320" y="175" textAnchor="middle" className="text-sm font-semibold fill-green-700">
                    Web Application
                  </text>
                  <circle cx="320" cy="200" r="15" fill="#16a34a" />
                  <text x="320" y="205" textAnchor="middle" className="text-xs fill-white font-bold">
                    ⚛
                  </text>
                  <text x="320" y="230" textAnchor="middle" className="text-xs fill-green-600">
                    Next.js 15
                  </text>
                </g>

                {/* Server */}
                <g>
                  <rect
                    x="450"
                    y="100"
                    width="120"
                    height="80"
                    rx="8"
                    fill="#fef3c7"
                    stroke="#d97706"
                    strokeWidth="2"
                  />
                  <text x="510" y="125" textAnchor="middle" className="text-sm font-semibold fill-amber-700">
                    Server
                  </text>
                  <rect x="475" y="135" width="15" height="15" fill="#d97706" />
                  <rect x="495" y="135" width="15" height="15" fill="#d97706" />
                  <rect x="515" y="135" width="15" height="15" fill="#d97706" />
                  <text x="510" y="165" textAnchor="middle" className="text-xs fill-amber-600">
                    API Routes
                  </text>
                </g>

                {/* Data Retrieval */}
                <g>
                  <rect x="620" y="50" width="100" height="60" rx="8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                  <text x="670" y="70" textAnchor="middle" className="text-sm font-semibold fill-blue-700">
                    Data Retrieval
                  </text>
                  <circle cx="650" cy="85" r="8" fill="#16a34a" />
                  <circle cx="670" cy="85" r="8" fill="#0284c7" />
                  <circle cx="690" cy="85" r="8" fill="#7c3aed" />
                </g>

                {/* Database */}
                <g>
                  <rect x="750" y="30" width="80" height="60" rx="8" fill="#f3e8ff" stroke="#7c3aed" strokeWidth="2" />
                  <text x="790" y="50" textAnchor="middle" className="text-sm font-semibold fill-purple-700">
                    DB
                  </text>
                  <rect x="770" y="55" width="40" height="8" fill="#7c3aed" />
                  <rect x="770" y="65" width="40" height="8" fill="#7c3aed" />
                  <rect x="770" y="75" width="40" height="8" fill="#7c3aed" />
                </g>

                {/* Services */}
                <g>
                  <rect x="870" y="50" width="80" height="60" rx="8" fill="#fecaca" stroke="#dc2626" strokeWidth="2" />
                  <text x="910" y="70" textAnchor="middle" className="text-sm font-semibold fill-red-700">
                    Services
                  </text>
                  <text x="910" y="85" textAnchor="middle" className="text-xs fill-red-600">
                    Auth0
                  </text>
                  <text x="910" y="95" textAnchor="middle" className="text-xs fill-red-600">
                    FAISS
                  </text>
                </g>

                {/* Data Processing Pipeline */}
                <g>
                  <rect x="50" y="300" width="150" height="60" rx="8" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
                  <text x="125" y="320" textAnchor="middle" className="text-sm font-semibold fill-green-700">
                    Convert to CSV/Parquet
                  </text>
                  <text x="125" y="340" textAnchor="middle" className="text-xs fill-green-600">
                    Python, xarray, netCF4, Pandas
                  </text>
                </g>

                {/* Clean & QC Filter */}
                <g>
                  <rect x="50" y="400" width="150" height="60" rx="8" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
                  <text x="125" y="420" textAnchor="middle" className="text-sm font-semibold fill-green-700">
                    Clean & QC Filter
                  </text>
                  <text x="125" y="440" textAnchor="middle" className="text-xs fill-green-600">
                    Data Quality Control
                  </text>
                </g>

                {/* Generate Profile Summaries */}
                <g>
                  <rect x="50" y="500" width="150" height="60" rx="8" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
                  <text x="125" y="520" textAnchor="middle" className="text-sm font-semibold fill-green-700">
                    Generate Profile
                  </text>
                  <text x="125" y="535" textAnchor="middle" className="text-sm font-semibold fill-green-700">
                    Summaries
                  </text>
                </g>

                {/* RAG Retriever */}
                <g>
                  <rect
                    x="350"
                    y="400"
                    width="200"
                    height="120"
                    rx="8"
                    fill="#dcfce7"
                    stroke="#16a34a"
                    strokeWidth="2"
                  />
                  <text x="450" y="425" textAnchor="middle" className="text-lg font-bold fill-green-700">
                    Retriever: RAG
                  </text>

                  {/* User Query inputs */}
                  <rect x="250" y="350" width="80" height="30" rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
                  <text x="290" y="370" textAnchor="middle" className="text-xs fill-amber-700">
                    User Query
                  </text>

                  <rect x="250" y="480" width="80" height="30" rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
                  <text x="290" y="500" textAnchor="middle" className="text-xs fill-amber-700">
                    User Query
                  </text>
                </g>

                {/* Backend Database */}
                <g>
                  <rect
                    x="600"
                    y="350"
                    width="120"
                    height="80"
                    rx="8"
                    fill="#f3e8ff"
                    stroke="#7c3aed"
                    strokeWidth="2"
                  />
                  <text x="660" y="375" textAnchor="middle" className="text-sm font-semibold fill-purple-700">
                    Backend Database
                  </text>
                  <text x="660" y="395" textAnchor="middle" className="text-xs fill-purple-600">
                    Supabase, PostGIS
                  </text>
                  <rect x="620" y="405" width="80" height="8" fill="#7c3aed" />
                  <rect x="620" y="415" width="80" height="8" fill="#7c3aed" />
                </g>

                {/* Vector Databases */}
                <g>
                  <rect x="600" y="450" width="50" height="60" rx="8" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
                  <text x="625" y="470" textAnchor="middle" className="text-xs font-semibold fill-green-700">
                    FAISS
                  </text>
                  <text x="625" y="485" textAnchor="middle" className="text-xs fill-green-600">
                    Vector DB
                  </text>

                  <rect x="670" y="450" width="50" height="60" rx="8" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
                  <text x="695" y="470" textAnchor="middle" className="text-xs font-semibold fill-green-700">
                    PostgreSQL
                  </text>
                  <text x="695" y="485" textAnchor="middle" className="text-xs fill-green-600">
                    Vector DB
                  </text>
                </g>

                {/* PostgreSQL DB */}
                <g>
                  <rect
                    x="350"
                    y="580"
                    width="120"
                    height="60"
                    rx="8"
                    fill="#dcfce7"
                    stroke="#16a34a"
                    strokeWidth="2"
                  />
                  <text x="410" y="605" textAnchor="middle" className="text-sm font-semibold fill-green-700">
                    PostgreSQL DB
                  </text>
                  <text x="410" y="620" textAnchor="middle" className="text-xs fill-green-600">
                    OpenRouter, embeddings
                  </text>
                </g>

                {/* AI Processing */}
                <g>
                  <rect
                    x="500"
                    y="580"
                    width="150"
                    height="80"
                    rx="8"
                    fill="#dcfce7"
                    stroke="#16a34a"
                    strokeWidth="2"
                  />
                  <text x="575" y="605" textAnchor="middle" className="text-sm font-semibold fill-green-700">
                    AI
                  </text>
                  <rect x="520" y="615" width="110" height="30" fill="#16a34a" />
                  <text x="575" y="635" textAnchor="middle" className="text-sm font-bold fill-white">
                    🧠 LLM
                  </text>
                </g>

                {/* LLM */}
                <g>
                  <rect
                    x="350"
                    y="700"
                    width="100"
                    height="60"
                    rx="8"
                    fill="#dcfce7"
                    stroke="#16a34a"
                    strokeWidth="2"
                  />
                  <text x="400" y="725" textAnchor="middle" className="text-sm font-semibold fill-green-700">
                    LLM
                  </text>
                  <text x="400" y="745" textAnchor="middle" className="text-xs fill-green-600">
                    GPT-4, OpenRouter
                  </text>
                </g>

                {/* Frontend Components */}
                <g>
                  <rect
                    x="500"
                    y="700"
                    width="120"
                    height="60"
                    rx="8"
                    fill="#dcfce7"
                    stroke="#16a34a"
                    strokeWidth="2"
                  />
                  <text x="560" y="720" textAnchor="middle" className="text-sm font-semibold fill-green-700">
                    Chatbot UI
                  </text>
                  <text x="560" y="740" textAnchor="middle" className="text-xs fill-green-600">
                    React, Tailwind
                  </text>
                </g>

                <g>
                  <rect
                    x="650"
                    y="700"
                    width="150"
                    height="60"
                    rx="8"
                    fill="#dcfce7"
                    stroke="#16a34a"
                    strokeWidth="2"
                  />
                  <text x="725" y="720" textAnchor="middle" className="text-sm font-semibold fill-green-700">
                    Dashboard: Next.js/React UI
                  </text>
                  <text x="725" y="740" textAnchor="middle" className="text-xs fill-green-600">
                    Next.js 14, React, Tailwind, Leaflet, Plotly
                  </text>
                </g>

                {/* Arrows */}
                {/* Client to Auth */}
                <path d="M 110 130 L 110 175" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />

                {/* Auth to Web App */}
                <path d="M 135 200 L 250 200" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />

                {/* Web App to Server */}
                <path d="M 390 200 L 450 140" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />

                {/* Server to Data Retrieval */}
                <path d="M 570 140 L 620 80" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />

                {/* Data Retrieval to DB */}
                <path d="M 720 80 L 750 60" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />

                {/* Data Processing Flow */}
                <path d="M 125 360 L 125 400" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <path d="M 125 460 L 125 500" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <path d="M 200 530 L 350 460" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrowhead)" />

                {/* RAG to Databases */}
                <path d="M 550 460 L 600 390" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <path d="M 550 480 L 600 480" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrowhead)" />

                {/* To AI Processing */}
                <path d="M 450 520 L 500 620" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrowhead)" />

                {/* AI to LLM and UI */}
                <path d="M 500 640 L 450 730" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <path d="M 575 660 L 560 700" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <path d="M 650 640 L 725 700" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrowhead)" />

                {/* Arrow marker definition */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                  </marker>
                </defs>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Workflow Steps */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center mb-8">Detailed Workflow</h2>

          {/* Step 1: Data Ingestion */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <CardTitle className="text-blue-600">Data Ingestion & Storage</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Supabase Database Schema</h4>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono">
                    <div className="space-y-1">
                      <div>
                        <span className="text-blue-600">id:</span> bigserial (primary key)
                      </div>
                      <div>
                        <span className="text-blue-600">file:</span> text (source file)
                      </div>
                      <div>
                        <span className="text-blue-600">date:</span> timestamp (profile date)
                      </div>
                      <div>
                        <span className="text-blue-600">lat, lon:</span> coordinates
                      </div>
                      <div>
                        <span className="text-blue-600">mld:</span> mixed layer depth
                      </div>
                      <div>
                        <span className="text-blue-600">thermoclinedepth:</span> thermal structure
                      </div>
                      <div>
                        <span className="text-blue-600">surfacetemp, surfacesal:</span> surface values
                      </div>
                      <div>
                        <span className="text-blue-600">ohc_0_200m:</span> ocean heat content
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Characteristics</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Indian Ocean focus with monsoon patterns
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Temperature range: 26.5-30.2°C
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Salinity range: 33.5-36.8 PSU
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Mixed layer depth: 15-85m
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Vector Processing */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">2</span>
                </div>
                <CardTitle className="text-purple-600">Vector Processing & Embeddings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Metadata Extraction</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Oceanographic context</li>
                    <li>• Monsoon period classification</li>
                    <li>• Thermal structure analysis</li>
                    <li>• Water mass identification</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Text Generation</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Profile summaries</li>
                    <li>• Seasonal context</li>
                    <li>• Regional characteristics</li>
                    <li>• Searchable descriptions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">FAISS Storage</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 384-dimensional vectors</li>
                    <li>• Cosine similarity search</li>
                    <li>• Metadata preservation</li>
                    <li>• Fast retrieval (&lt; 100ms)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Query Processing */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">3</span>
                </div>
                <CardTitle className="text-green-600">Intelligent Query Processing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Query Classification</h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h5 className="font-medium text-blue-700">SQL Mode</h5>
                      <p className="text-sm text-blue-600">Structured queries → Direct database access</p>
                      <p className="text-xs text-muted-foreground">"Show 5 profiles from Arabian Sea in 2023"</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <h5 className="font-medium text-purple-700">Semantic Mode</h5>
                      <p className="text-sm text-purple-600">Natural language → Vector search</p>
                      <p className="text-xs text-muted-foreground">"Where are the warmest waters?"</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <h5 className="font-medium text-orange-700">Hybrid Mode</h5>
                      <p className="text-sm text-orange-600">Complex queries → Both methods</p>
                      <p className="text-xs text-muted-foreground">"Compare monsoon salinity patterns"</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">MCP Server Integration</h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span>
                          <strong>queryARGO:</strong> SQL-based retrieval
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-blue-500" />
                        <span>
                          <strong>retrieveARGO:</strong> Vector similarity search
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span>
                          <strong>analyzeProfile:</strong> Contextual analysis
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-green-500" />
                        <span>
                          <strong>generateInsights:</strong> Pattern detection
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Response Generation */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">4</span>
                </div>
                <CardTitle className="text-orange-600">Response Generation & Delivery</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">LLM Processing</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Context-aware response generation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Oceanographic expertise integration
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Multi-modal output (text + actions)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Real-time streaming responses
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Interactive Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="justify-start bg-transparent">
                      <Globe className="h-3 w-3 mr-2" />
                      Show Map
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start bg-transparent">
                      <BarChart3 className="h-3 w-3 mr-2" />
                      View Charts
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start bg-transparent">
                      <Database className="h-3 w-3 mr-2" />
                      Browse Data
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start bg-transparent">
                      <Download className="h-3 w-3 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Specifications */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Technical Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Backend Stack</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    • <strong>Database:</strong> Supabase PostgreSQL
                  </li>
                  <li>
                    • <strong>Vector Search:</strong> FAISS (browser-compatible)
                  </li>
                  <li>
                    • <strong>LLM:</strong> GPT-4 via OpenRouter
                  </li>
                  <li>
                    • <strong>Framework:</strong> Next.js 15 App Router
                  </li>
                  <li>
                    • <strong>Language:</strong> TypeScript + Python
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Performance Metrics</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    • <strong>Query Response:</strong> &lt; 2 seconds
                  </li>
                  <li>
                    • <strong>Vector Search:</strong> &lt; 100ms
                  </li>
                  <li>
                    • <strong>Database Query:</strong> &lt; 50ms
                  </li>
                  <li>
                    • <strong>Embedding Generation:</strong> &lt; 500ms
                  </li>
                  <li>
                    • <strong>Concurrent Users:</strong> 100+
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Data Capabilities</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    • <strong>Profiles:</strong> 10,000+ ARGO floats
                  </li>
                  <li>
                    • <strong>Coverage:</strong> Indian Ocean basin
                  </li>
                  <li>
                    • <strong>Parameters:</strong> T, S, MLD, OHC
                  </li>
                  <li>
                    • <strong>Time Range:</strong> 2000-2024
                  </li>
                  <li>
                    • <strong>Update Frequency:</strong> Real-time
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Run */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-6 w-6 text-primary" />
              How to Run This Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Prerequisites</h4>
                <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono">
                  <div className="space-y-1">
                    <div># Install dependencies</div>
                    <div>npm install</div>
                    <div></div>
                    <div># Python requirements</div>
                    <div>pip install -r scripts/requirements.txt</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Environment Variables</h4>
                <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono">
                  <div className="space-y-1">
                    <div>SUPABASE_URL=your_supabase_url</div>
                    <div>SUPABASE_ANON_KEY=your_anon_key</div>
                    <div>OPENAI_API_KEY=your_openai_key</div>
                    <div>OPENROUTER_API_KEY=your_openrouter_key</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Running the Application</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-700 mb-2">1. Start Development Server</h5>
                  <code className="text-sm bg-white px-2 py-1 rounded">npm run dev</code>
                  <p className="text-xs text-muted-foreground mt-2">Launches Next.js on localhost:3000</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h5 className="font-medium text-purple-700 mb-2">2. Initialize Vector Search</h5>
                  <code className="text-sm bg-white px-2 py-1 rounded">python scripts/setup_vectors.py</code>
                  <p className="text-xs text-muted-foreground mt-2">Builds FAISS index from ARGO data</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-medium text-green-700 mb-2">3. Start Chatting</h5>
                  <code className="text-sm bg-white px-2 py-1 rounded">Open chat interface</code>
                  <p className="text-xs text-muted-foreground mt-2">Click the chat button to start</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">System Architecture Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <strong>Intelligent Query Routing:</strong> Automatically selects optimal retrieval method
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <strong>Contextual Understanding:</strong> Leverages oceanographic domain knowledge
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <strong>Multi-modal Responses:</strong> Text, visualizations, and interactive actions
                  </li>
                </ul>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <strong>Scalable Architecture:</strong> Handles complex oceanographic queries efficiently
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <strong>Real-time Processing:</strong> Fast response times with streaming capabilities
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <strong>Extensible Design:</strong> Easy to add new data sources and analysis methods
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Float Chat Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
