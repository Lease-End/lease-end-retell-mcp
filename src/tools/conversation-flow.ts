import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";

import {
  GetConversationFlowInputSchema,
  UpdateConversationFlowInputSchema,
  UpdateConversationFlowNodePromptInputSchema,
  UpdateConversationFlowNodeEdgeInputSchema,
  UpdateConversationFlowNodeAlwaysEdgeInputSchema,
  UpdateConversationFlowNodeFinetuneExamplesInputSchema,
  DeleteConversationFlowInputSchema,
} from "../schemas/index.js";
import { createToolHandler } from "./utils.js";

export const registerConversationFlowTools = (
  server: McpServer,
  retellClient: Retell
) => {
  // TypeScript note: Using type assertion for internal SDK methods
  // The retell-sdk doesn't export types for raw HTTP methods (.get, .patch, .delete)
  // but they exist on the client for advanced usage
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
    "update_conversation_flow_node_edge",
    "Updates the transition condition of a single edge on a node. Fetches the flow, finds the node and edge by ID, replaces the transition condition, and saves.",
    UpdateConversationFlowNodeEdgeInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const { conversationFlowId, nodeId, edgeId, transitionCondition } =
          data;

        const flow = await client.get(
          `/get-conversation-flow/${conversationFlowId}`
        );

        const updatedNodes = findAndUpdateEdgeCondition(
          flow.nodes,
          nodeId,
          edgeId,
          transitionCondition
        );

        const updated = await client.patch(
          `/update-conversation-flow/${conversationFlowId}`,
          { body: { nodes: updatedNodes } }
        );
        return updated;
      } catch (error: any) {
        console.error(
          `Error updating conversation flow node edge: ${error.message}`
        );
        throw error;
      }
    })
  );

  server.tool(
    "update_conversation_flow_node_always_edge",
    "Adds, removes, or changes the mode of an always/skip_response edge on a node. These are unconditional transitions that bypass condition evaluation. 'always' fires after any user response; 'skip_response' fires immediately without waiting for user input.",
    UpdateConversationFlowNodeAlwaysEdgeInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const { conversationFlowId, nodeId, action, mode, destinationNodeId } = data;

        const flow = await client.get(
          `/get-conversation-flow/${conversationFlowId}`
        );

        const updatedNodes = findAndUpdateAlwaysEdge(
          flow.nodes,
          nodeId,
          action,
          mode,
          destinationNodeId
        );

        const updated = await client.patch(
          `/update-conversation-flow/${conversationFlowId}`,
          { body: { nodes: updatedNodes } }
        );
        return updated;
      } catch (error: any) {
        console.error(
          `Error updating conversation flow node always edge: ${error.message}`
        );
        throw error;
      }
    })
  );

  server.tool(
    "update_conversation_flow_node_finetune_examples",
    "Updates finetune examples on a single node. Fetches the flow, finds the node by ID, replaces the specified finetune example field, and saves.",
    UpdateConversationFlowNodeFinetuneExamplesInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const { conversationFlowId, nodeId, field, examples } = data;

        const flow = await client.get(
          `/get-conversation-flow/${conversationFlowId}`
        );

        const updatedNodes = findAndUpdateFinetuneExamples(
          flow.nodes,
          nodeId,
          field,
          examples
        );

        const updated = await client.patch(
          `/update-conversation-flow/${conversationFlowId}`,
          { body: { nodes: updatedNodes } }
        );
        return updated;
      } catch (error: any) {
        console.error(
          `Error updating conversation flow node finetune examples: ${error.message}`
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
  if (node.instruction && typeof node.instruction === "object") {
    node.instruction = { ...node.instruction, text: instruction };
  } else {
    node.instruction = { type: "prompt", text: instruction };
  }
  return nodes;
}

function findAndUpdateEdgeCondition(
  nodes: any[],
  nodeId: string,
  edgeId: string,
  transitionCondition: { type: string; prompt?: string; operator?: string; equations?: Array<{ left: string; operator: string; right?: string }> }
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

  // First, search conditional edges array
  if (Array.isArray(node.edges) && node.edges.length > 0) {
    const edge = node.edges.find((e: any) => e.id === edgeId);
    if (edge) {
      edge.transition_condition = transitionCondition;
      return nodes;
    }
  }

  // Always/skip_response edges are unconditional — transition conditions don't apply
  if (node.always_edge?.id === edgeId) {
    throw new Error(
      `Edge ${edgeId} on node ${nodeId} is an always_edge (unconditional). ` +
      `Use update_conversation_flow_node_always_edge to modify it.`
    );
  }
  if (node.skip_response_edge?.id === edgeId) {
    throw new Error(
      `Edge ${edgeId} on node ${nodeId} is a skip_response_edge (unconditional). ` +
      `Use update_conversation_flow_node_always_edge to modify it.`
    );
  }

  // Build helpful error listing all available edges
  const availableEdges: string[] = [];
  if (Array.isArray(node.edges)) {
    availableEdges.push(...node.edges.map((e: any) => `${e.id} (→ ${e.destination_node_id})`));
  }
  if (node.always_edge) {
    availableEdges.push(`${node.always_edge.id} (always → ${node.always_edge.destination_node_id})`);
  }
  if (node.skip_response_edge) {
    availableEdges.push(`${node.skip_response_edge.id} (skip_response → ${node.skip_response_edge.destination_node_id})`);
  }

  if (availableEdges.length === 0) {
    throw new Error(
      `Node ${nodeId} has no edges (conditional, always, or skip_response). Cannot find edge ${edgeId}.`
    );
  }

  throw new Error(
    `Edge ${edgeId} not found on node ${nodeId}. Available edges: ${availableEdges.join(", ")}`
  );
}

function generateEdgeId(): string {
  // Generate a random edge ID matching Retell's format (e.g., "edge-1768419537209-i2zk6s4iy")
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const timestamp = Date.now();
  let suffix = "";
  for (let i = 0; i < 9; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `edge-${timestamp}-${suffix}`;
}

function findAndUpdateAlwaysEdge(
  nodes: any[],
  nodeId: string,
  action: string,
  mode?: string,
  destinationNodeId?: string
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

  if (action === "add") {
    if (!mode) {
      throw new Error(`'mode' is required for 'add' action. Must be 'always' or 'skip_response'.`);
    }
    if (!destinationNodeId) {
      throw new Error(`'destinationNodeId' is required for 'add' action.`);
    }
    if (node.always_edge || node.skip_response_edge) {
      const existing = node.always_edge ? "always_edge" : "skip_response_edge";
      throw new Error(
        `Node ${nodeId} already has a ${existing}. Remove it first or use 'change_mode' to switch modes.`
      );
    }

    const newEdge = {
      id: generateEdgeId(),
      destination_node_id: destinationNodeId,
    };

    if (mode === "always") {
      node.always_edge = newEdge;
    } else {
      node.skip_response_edge = newEdge;
    }
  } else if (action === "remove") {
    if (!node.always_edge && !node.skip_response_edge) {
      throw new Error(
        `Node ${nodeId} has no always_edge or skip_response_edge to remove.`
      );
    }
    delete node.always_edge;
    delete node.skip_response_edge;
  } else if (action === "change_mode") {
    if (!mode) {
      throw new Error(`'mode' is required for 'change_mode' action. Must be 'always' or 'skip_response'.`);
    }

    // Find the existing edge (either type)
    const existingEdge = node.always_edge || node.skip_response_edge;
    if (!existingEdge) {
      throw new Error(
        `Node ${nodeId} has no always_edge or skip_response_edge to change mode on.`
      );
    }

    // Preserve the edge data but swap the field
    const edgeData = { ...existingEdge };
    if (destinationNodeId) {
      edgeData.destination_node_id = destinationNodeId;
    }
    delete node.always_edge;
    delete node.skip_response_edge;

    if (mode === "always") {
      node.always_edge = edgeData;
    } else {
      node.skip_response_edge = edgeData;
    }
  } else {
    throw new Error(`Unknown action '${action}'. Must be 'add', 'remove', or 'change_mode'.`);
  }

  return nodes;
}

function findAndUpdateFinetuneExamples(
  nodes: any[],
  nodeId: string,
  field: string,
  examples: any[]
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

  if (node.type && node.type !== "conversation") {
    throw new Error(
      `Node ${nodeId} is of type "${node.type}" which does not support finetune examples. Only "conversation" nodes have finetune example fields.`
    );
  }

  node[field] = examples;
  return nodes;
}
