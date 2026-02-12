import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";

import {
  CreateKnowledgeBaseInputSchema,
  GetKnowledgeBaseInputSchema,
  DeleteKnowledgeBaseInputSchema,
  AddKnowledgeBaseSourcesInputSchema,
  DeleteKnowledgeBaseSourceInputSchema,
} from "../schemas/index.js";
import { createToolHandler } from "./utils.js";

export const registerKnowledgeBaseTools = (
  server: McpServer,
  retellClient: Retell
) => {
  server.tool(
    "list_knowledge_bases",
    "Lists all knowledge bases",
    {},
    createToolHandler(async () => {
      const kbs = await retellClient.knowledgeBase.list();
      return kbs;
    })
  );

  server.tool(
    "create_knowledge_base",
    "Creates a new knowledge base. Pricing: $0.005/min per call + $8/month per KB (10 free/workspace)",
    CreateKnowledgeBaseInputSchema.shape,
    createToolHandler(async (data) => {
      const kb = await retellClient.knowledgeBase.create(data);
      return kb;
    })
  );

  server.tool(
    "get_knowledge_base",
    "Gets a knowledge base by ID",
    GetKnowledgeBaseInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const kb = await retellClient.knowledgeBase.retrieve(
          data.knowledgeBaseId
        );
        if (!kb) {
          throw new Error(
            `Knowledge base with ID ${data.knowledgeBaseId} not found`
          );
        }
        return kb;
      } catch (error: any) {
        console.error(`Error getting knowledge base: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "delete_knowledge_base",
    "Deletes a knowledge base",
    DeleteKnowledgeBaseInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        await retellClient.knowledgeBase.delete(data.knowledgeBaseId);
        return {
          success: true,
          message: `Knowledge base ${data.knowledgeBaseId} deleted successfully`,
        };
      } catch (error: any) {
        console.error(`Error deleting knowledge base: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "add_knowledge_base_sources",
    "Adds sources (URLs, files, text) to a knowledge base",
    AddKnowledgeBaseSourcesInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const { knowledgeBaseId, sources } = data;
        const result = await retellClient.knowledgeBase.addSources(
          knowledgeBaseId,
          { sources }
        );
        return result;
      } catch (error: any) {
        console.error(`Error adding KB sources: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "delete_knowledge_base_source",
    "Deletes a specific source from a knowledge base",
    DeleteKnowledgeBaseSourceInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        // Note: SDK might not have direct deleteSource method
        // Using raw client access as fallback
        const client = retellClient as any;
        await client.delete(
          `/delete-knowledge-base-source/${data.knowledgeBaseId}/${data.sourceId}`
        );
        return {
          success: true,
          message: `Source ${data.sourceId} deleted from KB ${data.knowledgeBaseId}`,
        };
      } catch (error: any) {
        console.error(`Error deleting KB source: ${error.message}`);
        throw error;
      }
    })
  );
};
