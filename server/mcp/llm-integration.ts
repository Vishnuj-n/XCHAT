import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"
import { ARGOTools } from "./tools.js"

export class MCPServerWithLLM {
  private server: Server
  private argoTools: ARGOTools

  constructor() {
    this.server = new Server(
      {
        name: "argo-oceanographic-server",
        version: "1.0.0",
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
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.argoTools.getToolDefinitions(),
      }
    })

    // Handle tool calls from LLM
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        let result

        switch (name) {
          case "queryARGO":
            result = await this.argoTools.executeQueryARGO(args)
            break
          case "retrieveARGO":
            result = await this.argoTools.executeRetrieveARGO(args)
            break
          case "getARGOByLocation":
            result = await this.argoTools.executeGetARGOByLocation(args)
            break
          case "getARGOByDateRange":
            result = await this.argoTools.executeGetARGOByDateRange(args)
            break
          default:
            throw new Error(`Unknown tool: ${name}`)
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: error instanceof Error ? error.message : "Unknown error",
                  metadata: {
                    timestamp: new Date().toISOString(),
                    source: "mcp_server",
                    execution_time: 0,
                  },
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        }
      }
    })
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.log("ARGO MCP Server with LLM integration started")
  }
}

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MCPServerWithLLM()
  server.start().catch(console.error)
}
