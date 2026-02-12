# Lease End Retell MCP Server

**Custom fork for Lease End's diagnostic pipeline** - Based on [MCP-Mirror/abhaybabbar_retellai-mcp-server](https://github.com/MCP-Mirror/abhaybabbar_retellai-mcp-server)

This is a Model Context Protocol (MCP) server implementation for RetellAI, extended with custom tools and features for the Lease End diagnostic pipeline.

## 🎯 Lease End Customizations

This fork adds **20 additional tools** beyond the 8 original tools, bringing the total to **28 tools** for comprehensive Retell AI integration.

### Custom Tool Modules Added

**Conversation Flow Management** (`conversation-flow.ts`)
- Advanced flow operations for diagnostic analysis
- Node prompt updates
- Flow versioning and retrieval

**Batch Testing** (`batch-test.ts`)
- `create_batch_test` - Run automated test cases (1-200)
- `get_batch_test` - Retrieve batch test results
- `list_batch_tests` - List all batch tests
- `create_test_case`, `update_test_case`, `delete_test_case`, `get_test_case`, `list_test_cases`

**Knowledge Base Management** (`knowledge-base.ts`)
- `create_knowledge_base`, `get_knowledge_base`, `list_knowledge_bases`, `delete_knowledge_base`
- `add_knowledge_base_sources`, `delete_knowledge_base_source`

**Shared Components** (`shared-component.ts`)
- `create_shared_component`, `get_shared_component`, `update_shared_component`
- `delete_shared_component`, `list_shared_components`

**Concurrency Monitoring** (`concurrency.ts`)
- `get_concurrency_status` - Real-time call usage tracking

### Modified Core Files
- `package.json` - Added new dependencies for extended functionality
- `src/index.ts` - Registered 20 new tools
- `src/schemas/index.ts` - Added schemas for new tools
- `src/tools/index.ts` - Exported new tool modules

### Use Case
This MCP server powers the [Retell Diagnostic Pipeline](https://github.com/Lease-End/retell-diagnostic-pipeline), a 7-agent system that:
1. Analyzes failed Retell AI voice agent calls
2. Diagnoses root causes in conversation flows
3. Generates targeted patches
4. Validates patches through simulation and regression testing
5. Presents deployment recommendations

## Features

The RetellAI MCP server provides tools for:

- **Call Management**: Create and manage phone calls and web calls
- **Agent Management**: Create and manage voice agents with different LLM configurations
- **Phone Number Management**: Provision and configure phone numbers
- **Voice Management**: Access and use different voice options

## Claude Desktop Setup

1. Open `Claude Desktop` and press `CMD + ,` to go to `Settings`.
2. Click on the `Developer` tab.
3. Click on the `Edit Config` button.
4. This will open the `claude_desktop_config.json` file in your file explorer.
5. Get your Retell API key from the Retell dashboard (<https://dashboard.retellai.com/apiKey>).
6. Add the following to your `claude_desktop_config.json` file. See [here](https://modelcontextprotocol.io/quickstart/user) for more details.
7. Restart the Claude Desktop after editing the config file.

```json
{
  "mcpServers": {
    "retellai-mcp-server": {
      "command": "npx",
      "args": ["-y", "@abhaybabbar/retellai-mcp-server"],
      "env": {
        "RETELL_API_KEY": "<your_retellai_token>"
      }
    }
  }
}
```

## Example use cases:

1. List all the numbers I have in retellai
2. List all the agents I have
3. Tell me more about pizza delivery agent
4. Creating agent and calling example:
   1. Create an agent that calls my local pizza shop, make sure to keep the conversation short and to the point.
   2. Order a margeritta pizza
   3. Payment will be done by cash on delivery
   4. Send it to <address>
   5. The agent should pretend to be me. My name is <your_name>
   6. Make an outbound call to my local pizza shop at <phone_number>, using the usa number

## Repo Setup

1. Install dependencies:

   ```bash
   npm i
   ```

2. Create a `.env` file with your RetellAI API key:

   ```
   RETELL_API_KEY=your_api_key_here
   ```

3. Run the server:
   ```bash
   node src/retell/index.js
   ```

## Available Tools

### Call Tools

- `list_calls`: Lists all Retell calls
- `create_phone_call`: Creates a new phone call
- `create_web_call`: Creates a new web call
- `get_call`: Gets details of a specific call
- `delete_call`: Deletes a specific call

### Agent Tools

- `list_agents`: Lists all Retell agents
- `create_agent`: Creates a new Retell agent
- `get_agent`: Gets a Retell agent by ID
- `update_agent`: Updates an existing Retell agent
- `delete_agent`: Deletes a Retell agent
- `get_agent_versions`: Gets all versions of a Retell agent

### Phone Number Tools

- `list_phone_numbers`: Lists all Retell phone numbers
- `create_phone_number`: Creates a new phone number
- `get_phone_number`: Gets details of a specific phone number
- `update_phone_number`: Updates a phone number
- `delete_phone_number`: Deletes a phone number

### Voice Tools

- `list_voices`: Lists all available Retell voices
- `get_voice`: Gets details of a specific voice

### Conversation Flow Tools (Custom)

- `get_conversation_flow`: Gets conversation flow definition
- `update_conversation_flow`: Updates conversation flow
- `update_conversation_flow_node_prompt`: Updates individual node instructions

### Batch Testing Tools (Custom)

- `create_batch_test`: Run automated test cases
- `get_batch_test`: Get batch test results
- `list_batch_tests`: List all batch tests
- `create_test_case`, `update_test_case`, `delete_test_case`, `get_test_case`, `list_test_cases`

### Knowledge Base Tools (Custom)

- `create_knowledge_base`, `get_knowledge_base`, `list_knowledge_bases`, `delete_knowledge_base`
- `add_knowledge_base_sources`, `delete_knowledge_base_source`

### Shared Component Tools (Custom)

- `create_shared_component`, `get_shared_component`, `update_shared_component`
- `delete_shared_component`, `list_shared_components`

### Monitoring Tools (Custom)

- `get_concurrency_status`: Check concurrent call usage and limits

---

**Total: 28 tools** (8 original + 20 custom)

## Upstream Sync

To pull updates from the original MCP-Mirror repository:

```bash
git fetch upstream
git merge upstream/main
# Resolve any conflicts between custom changes and upstream updates
```

## License

MIT
