import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";

import {
  CreateSharedComponentInputSchema,
  GetSharedComponentInputSchema,
  UpdateSharedComponentInputSchema,
  DeleteSharedComponentInputSchema,
} from "../schemas/index.js";
import { createToolHandler } from "./utils.js";

export const registerSharedComponentTools = (
  server: McpServer,
  retellClient: Retell
) => {
  const client = retellClient as any;

  server.tool(
    "list_shared_components",
    "Lists all shared conversation flow components",
    {},
    createToolHandler(async () => {
      const components = await client.get("/list-shared-components");
      return components;
    })
  );

  server.tool(
    "create_shared_component",
    "Creates a new shared component (reusable sub-flow). Changes to shared components affect ALL flows that embed them.",
    CreateSharedComponentInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const component = await client.post("/create-shared-component", {
          body: data,
        });
        return component;
      } catch (error: any) {
        console.error(`Error creating shared component: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "get_shared_component",
    "Retrieves a shared component by ID",
    GetSharedComponentInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const component = await client.get(
          `/get-shared-component/${data.componentId}`
        );
        return component;
      } catch (error: any) {
        console.error(`Error getting shared component: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "update_shared_component",
    "Updates an existing shared component. WARNING: This updates ALL flows that embed this component!",
    UpdateSharedComponentInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const { componentId, ...updateFields } = data;
        const updated = await client.patch(
          `/update-shared-component/${componentId}`,
          { body: updateFields }
        );
        return updated;
      } catch (error: any) {
        console.error(`Error updating shared component: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "delete_shared_component",
    "Deletes a shared component. WARNING: This will break all flows that embed this component!",
    DeleteSharedComponentInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        await client.delete(`/delete-shared-component/${data.componentId}`);
        return {
          success: true,
          message: `Shared component ${data.componentId} deleted successfully`,
        };
      } catch (error: any) {
        console.error(`Error deleting shared component: ${error.message}`);
        throw error;
      }
    })
  );
};
