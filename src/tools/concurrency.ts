import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";

import { createToolHandler } from "./utils.js";

export const registerConcurrencyTools = (
  server: McpServer,
  retellClient: Retell
) => {
  server.tool(
    "get_concurrency_status",
    "Get current concurrency usage and limit. Default limit: 20 concurrent calls. Concurrency Blast available: up to 3x limit or 300 calls at $0.1/min",
    {},
    createToolHandler(async () => {
      try {
        const status = await retellClient.concurrency.retrieve();
        return status;
      } catch (error: any) {
        console.error(`Error getting concurrency status: ${error.message}`);
        throw error;
      }
    })
  );
};
