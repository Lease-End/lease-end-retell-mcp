import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";

import {
  GetConversationFlowInputSchema,
  UpdateConversationFlowInputSchema,
  UpdateConversationFlowNodePromptInputSchema,
  DeleteConversationFlowInputSchema,
} from "../schemas/index.js";
import { createToolHandler } from "./utils.js";

export const registerConversationFlowTools = (
  server: McpServer,
  retellClient: Retell
) => {
  const client = retellClient as any;

  server.tool(
    "list_conversation_flows",
    "Lists all conversation flows",
    {},
    createToolHandler(async () => {
      const flows = await client.get("/list-conversation-flows");
      return flows;
    })
  );

  server.tool(
    "get_conversation_flow",
    "Retrieves a conversation flow by ID, including all nodes, prompts, and edges",
    GetConversationFlowInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const query =
          data.version !== undefined ? { version: data.version } : {};
        const flow = await client.get(
          `/get-conversation-flow/${data.conversationFlowId}`,
          { query }
        );
        return flow;
      } catch (error: any) {
        console.error(`Error getting conversation flow: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "update_conversation_flow",
    "Updates an existing conversation flow (nodes, global_prompt, start_node_id, etc.)",
    UpdateConversationFlowInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const { conversationFlowId, ...updateFields } = data;
        const updated = await client.patch(
          `/update-conversation-flow/${conversationFlowId}`,
          { body: updateFields }
        );
        return updated;
      } catch (error: any) {
        console.error(`Error updating conversation flow: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "update_conversation_flow_node_prompt",
    "Updates the instruction/prompt of a single node in a conversation flow. Fetches the flow, finds the node by ID, replaces its instruction, and saves.",
    UpdateConversationFlowNodePromptInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const { conversationFlowId, nodeId, instruction } = data;

        const flow = await client.get(
          `/get-conversation-flow/${conversationFlowId}`
        );

        const updatedNodes = findAndUpdateNodePrompt(
          flow.nodes,
          nodeId,
          instruction
        );

        const updated = await client.patch(
          `/update-conversation-flow/${conversationFlowId}`,
          { body: { nodes: updatedNodes } }
        );
        return updated;
      } catch (error: any) {
        console.error(
          `Error updating conversation flow node prompt: ${error.message}`
        );
        throw error;
      }
    })
  );

  server.tool(
    "delete_conversation_flow",
    "Deletes a conversation flow",
    DeleteConversationFlowInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        await client.delete(
          `/delete-conversation-flow/${data.conversationFlowId}`
        );
        return {
          success: true,
          message: `Conversation flow ${data.conversationFlowId} deleted successfully`,
        };
      } catch (error: any) {
        console.error(`Error deleting conversation flow: ${error.message}`);
        throw error;
      }
    })
  );
};

function findAndUpdateNodePrompt(
  nodes: any[],
  nodeId: string,
  instruction: string
): any[] {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    throw new Error(
      `Conversation flow has no nodes. Cannot find node ${nodeId}.`
    );
  }

  const node = nodes.find((n: any) => n.id === nodeId);
  if (!node) {
    throw new Error(
      `Node ${nodeId} not found in conversation flow. Available node IDs: ${nodes.map((n: any) => n.id).join(", ")}`
    );
  }
  node.instruction = instruction;
  return nodes;
}
