import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";

import {
  CreateBatchTestInputSchema,
  GetBatchTestInputSchema,
  CreateTestCaseInputSchema,
  UpdateTestCaseInputSchema,
  GetTestCaseInputSchema,
  DeleteTestCaseInputSchema,
} from "../schemas/index.js";
import { createToolHandler } from "./utils.js";

export const registerBatchTestTools = (
  server: McpServer,
  retellClient: Retell
) => {
  const client = retellClient as any;

  // ===== Batch Test Management =====

  server.tool(
    "create_batch_test",
    "Run a batch test with specified test case definitions. Pricing: $0.005 per dial (20k calls = $100)",
    CreateBatchTestInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const result = await client.post("/create-batch-test", {
          body: data,
        });
        return result;
      } catch (error: any) {
        console.error(`Error creating batch test: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "get_batch_test",
    "Get batch test results by ID, including pass/fail/error counts",
    GetBatchTestInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const result = await client.get(
          `/get-batch-test/${data.batchTestId}`
        );
        return result;
      } catch (error: any) {
        console.error(`Error getting batch test: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "list_batch_tests",
    "List all batch tests",
    {},
    createToolHandler(async () => {
      try {
        const result = await client.get("/list-batch-tests");
        return result;
      } catch (error: any) {
        console.error(`Error listing batch tests: ${error.message}`);
        throw error;
      }
    })
  );

  // ===== Test Case Management =====

  server.tool(
    "create_test_case",
    "Create a new test case definition for batch testing",
    CreateTestCaseInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const result = await client.post("/create-test-case", { body: data });
        return result;
      } catch (error: any) {
        console.error(`Error creating test case: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "get_test_case",
    "Get a test case by ID",
    GetTestCaseInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const result = await client.get(`/get-test-case/${data.testCaseId}`);
        return result;
      } catch (error: any) {
        console.error(`Error getting test case: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "update_test_case",
    "Update an existing test case",
    UpdateTestCaseInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const { testCaseId, ...updateFields } = data;
        const result = await client.patch(`/update-test-case/${testCaseId}`, {
          body: updateFields,
        });
        return result;
      } catch (error: any) {
        console.error(`Error updating test case: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "delete_test_case",
    "Delete a test case",
    DeleteTestCaseInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        await client.delete(`/delete-test-case/${data.testCaseId}`);
        return {
          success: true,
          message: `Test case ${data.testCaseId} deleted successfully`,
        };
      } catch (error: any) {
        console.error(`Error deleting test case: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "list_test_cases",
    "List all test cases",
    {},
    createToolHandler(async () => {
      try {
        const result = await client.get("/list-test-cases");
        return result;
      } catch (error: any) {
        console.error(`Error listing test cases: ${error.message}`);
        throw error;
      }
    })
  );
};
