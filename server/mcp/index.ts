#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"
import { ARGOTools } from "./tools.js"

class ARGOMCPServer {
  private server: Server
  private argoTools: ARGOTools

  constructor() {
    this.server = new Server(
      {
        name: "argo-oceanographic-server",
        version: "1.0.0",
        description: "MCP Server for ARGO oceanographic data analysis with SQL and vector search capabilities",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    this.argoTools = new ARGOTools()
    this.setupHandlers()
  }

  private setupHandlers() {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = this.argoTools.getToolDefinitions()
      return { tools }
    })

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case "queryARGO":
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(await this.argoTools.executeQueryARGO(args), null, 2),
                },
              ],
            }

          case "retrieveARGO":
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(await this.argoTools.executeRetrieveARGO(args), null, 2),
                },
              ],
            }

          case "getARGOByLocation":
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(await this.argoTools.executeGetARGOByLocation(args), null, 2),
                },
              ],
            }

          case "getARGOByDateRange":
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(await this.argoTools.executeGetARGOByDateRange(args), null, 2),
                },
              ],
            }

          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      } catch (error) {
        const errorResponse = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
          metadata: {
            timestamp: new Date().toISOString(),
            source: "mcp_server",
            execution_time: 0,
          },
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(errorResponse, null, 2),
            },
          ],
          isError: true,
        }
      }
    })

    // Error handling
    this.server.onerror = (error) => {
      console.error("[MCP Server Error]:", error)
    }

    process.on("SIGINT", async () => {
      await this.server.close()
      process.exit(0)
    })
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error("ARGO MCP Server running on stdio")
  }
}

// Start the server
const server = new ARGOMCPServer()
server.start().catch((error) => {
  console.error("Failed to start ARGO MCP Server:", error)
  process.exit(1)
})
