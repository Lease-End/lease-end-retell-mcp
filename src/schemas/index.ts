import { z } from "zod";

// ===== Call Schemas =====

export const CallType = {
  PhoneCall: "phone_call",
  WebCall: "web_call",
} as const;

export type CallTypeType = (typeof CallType)[keyof typeof CallType];

export const CallStatusSchema = z.enum([
  "registered",
  "in_progress",
  "completed",
  "failed",
  "canceled",
]);

export type CallStatus = z.infer<typeof CallStatusSchema>;

// Phone Call Input Schema
export const CreatePhoneCallInputSchema = z.object({
  fromNumber: z.string().describe("The phone number to call from"),
  toNumber: z.string().describe("The phone number to call to"),
  overrideAgentId: z
    .string()
    .optional()
    .describe(
      "For this particular call, override the agent used with this agent id"
    ),
  overrideAgentVersion: z
    .number()
    .optional()
    .describe(
      "For this particular call, override the agent version used with this version"
    ),
  direction: z.enum(["inbound", "outbound"]).default("outbound"),
  metadata: z.record(z.string()).optional(),
  retellLlmDynamicVariables: z
    .record(z.string())
    .optional()
    .describe("Dynamic variables to pass to the LLM in key-value pairs"),
  optOutSensitiveDataStorage: z.boolean().optional(),
  optInSignedUrl: z.boolean().optional(),
});

// Web Call Input Schema
export const CreateWebCallInputSchema = z.object({
  agentId: z.string().describe("The ID of the agent to use for the call"),
  metadata: z.record(z.string()).optional(),
  retellLlmDynamicVariables: z
    .record(z.string())
    .optional()
    .describe("Dynamic variables to pass to the LLM in key-value pairs"),
  optOutSensitiveDataStorage: z.boolean().optional(),
  optInSignedUrl: z.boolean().optional(),
});

// Get Call Input Schema
export const GetCallInputSchema = z.object({
  callId: z.string().describe("The ID of the call to retrieve"),
});

// Call Output Schema
export const CallOutputSchema = z.object({
  call_id: z.string(),
  call_type: z.enum([CallType.PhoneCall, CallType.WebCall]),
  agent_id: z.string(),
  version: z.number(),
  call_status: CallStatusSchema,
  metadata: z.record(z.string()).optional(),
  start_timestamp: z.number().optional(),
  end_timestamp: z.number().optional(),
  transcript: z.string().optional(),
  recording_url: z.string().optional(),
  disconnection_reason: z.string().optional(),
  call_analysis: z
    .object({
      call_summary: z.string().optional(),
      in_voicemail: z.boolean().optional(),
      user_sentiment: z
        .enum(["Negative", "Positive", "Neutral", "Unknown"])
        .optional(),
      call_successful: z.boolean().optional(),
      custom_analysis_data: z.record(z.any()).optional(),
    })
    .optional(),
  call_cost: z
    .object({
      product_costs: z.array(
        z.object({
          product: z.string(),
          unitPrice: z.number(),
          cost: z.number(),
        })
      ),
      total_duration_seconds: z.number(),
      total_duration_unit_price: z.number(),
      total_one_time_price: z.number(),
      combined_cost: z.number(),
    })
    .optional(),
});

// List Calls Input Schema
export const ListCallsInputSchema = z.object({
  agentId: z.string().optional().describe("Filter calls by agent ID"),
  startTimestamp: z
    .number()
    .optional()
    .describe("Filter calls after this timestamp"),
  endTimestamp: z
    .number()
    .optional()
    .describe("Filter calls before this timestamp"),
  limit: z.number().optional().describe("Maximum number of calls to return"),
  offset: z.number().optional().describe("Number of calls to skip"),
});

// Update Call Input Schema
export const UpdateCallInputSchema = z.object({
  callId: z.string().describe("The ID of the call to update"),
  metadata: z.record(z.string()).optional(),
  dynamicVariables: z.record(z.string()).optional(),
});

// Delete Call Input Schema
export const DeleteCallInputSchema = z.object({
  callId: z.string().describe("The ID of the call to delete"),
});

// ===== Agent Schemas =====

// Analysis Data Schemas
const StringAnalysisDataSchema = z.object({
  type: z.literal("string"),
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string()),
});

const EnumAnalysisDataSchema = z.object({
  type: z.literal("enum"),
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string()),
  choices: z.array(z.string()),
});

const BooleanAnalysisDataSchema = z.object({
  type: z.literal("boolean"),
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string()),
});

const NumberAnalysisDataSchema = z.object({
  type: z.literal("number"),
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string()),
});

const AnalysisDataSchema = z.discriminatedUnion("type", [
  StringAnalysisDataSchema,
  EnumAnalysisDataSchema,
  BooleanAnalysisDataSchema,
  NumberAnalysisDataSchema,
]);

export const CreateAgentInputSchema = z.object({
  response_engine: z.object({
    type: z.literal("retell-llm"),
    llm_id: z
      .string()
      .describe(
        "ID of the Retell LLM Response Engine, if llm_id not mentioned by user, create a new one"
      ),
    version: z.number().optional(),
  }),
  voice_id: z.string().describe("ID of the voice to use"),
  agent_name: z.string().optional().describe("Name of the agent"),
  voice_model: z
    .enum([
      "eleven_turbo_v2",
      "eleven_flash_v2",
      "eleven_turbo_v2_5",
      "eleven_flash_v2_5",
      "eleven_multilingual_v2",
      "Play3.0-mini",
      "PlayDialog",
    ])
    .optional(),
  // fallback_voice_ids: z.array(z.string()).optional(),
  // voice_temperature: z.number().optional(),
  // voice_speed: z.number().optional(),
  // volume: z.number().optional(),
  // responsiveness: z.number().optional(),
  // interruption_sensitivity: z.number().optional(),
  // enable_backchannel: z.boolean().optional(),
  // backchannel_frequency: z.number().optional(),
  // backchannel_words: z.array(z.string()).optional(),
  // reminder_trigger_ms: z.number().optional(),
  // reminder_max_count: z.number().optional(),
  // ambient_sound: z
  //   .enum([
  //     "coffee-shop",
  //     "convention-hall",
  //     "summer-outdoor",
  //     "mountain-outdoor",
  //     "static-noise",
  //     "call-center",
  //   ])
  //   .optional(),
  // ambient_sound_volume: z.number().optional(),
  language: z
    .enum([
      "en-US",
      "en-IN",
      "en-GB",
      "en-AU",
      "en-NZ",
      "de-DE",
      "es-ES",
      "es-419",
      "hi-IN",
      "fr-FR",
      "fr-CA",
      "ja-JP",
      "pt-PT",
      "pt-BR",
      "zh-CN",
      "ru-RU",
      "it-IT",
      "ko-KR",
    ])
    .optional(),
  // webhook_url: z.string().optional(),
  // boosted_keywords: z.array(z.string()).optional(),
  // enable_transcription_formatting: z.boolean().optional(),
  // opt_out_sensitive_data_storage: z.boolean().optional(),
  // opt_in_signed_url: z.boolean().optional(),
  // pronunciation_dictionary: z
  //   .array(
  //     z.object({
  //       word: z.string(),
  //       alphabet: z.enum(["ipa", "cmu"]),
  //       phoneme: z.string(),
  //     })
  //   )
  //   .optional(),
  // normalize_for_speech: z.boolean().optional(),
  // end_call_after_silence_ms: z.number().optional(),
  // max_call_duration_ms: z.number().optional(),
  // enable_voicemail_detection: z.boolean().optional(),
  // voicemail_message: z.string().optional(),
  // voicemail_detection_timeout_ms: z.number().optional(),
  // post_call_analysis_data: z.array(AnalysisDataSchema).optional(),
  // post_call_analysis_model: z.enum(["gpt-4o-mini", "gpt-4o"]).optional(),
  // begin_message_delay_ms: z.number().optional(),
  // ring_duration_ms: z.number().optional(),
  // stt_mode: z.enum(["fast", "accurate"]).optional(),
});

export const GetAgentInputSchema = z.object({
  agentId: z.string().describe("The ID of the agent to retrieve"),
});

export const UpdateAgentInputSchema = z.object({
  agentId: z.string().describe("The ID of the agent to update"),
  response_engine: z
    .object({
      type: z.literal("retell-llm"),
      llm_id: z.string().optional(),
      version: z.number().optional(),
    })
    .optional(),
  voice_id: z.string().optional(),
  agent_name: z.string().optional(),
  voice_model: z.string().optional(),
  fallback_voice_ids: z.array(z.string()).optional(),
  voice_temperature: z.number().optional(),
  voice_speed: z.number().optional(),
  volume: z.number().optional(),
  responsiveness: z.number().optional(),
  interruption_sensitivity: z.number().optional(),
  enable_backchannel: z.boolean().optional(),
  backchannel_frequency: z.number().optional(),
  backchannel_words: z.array(z.string()).optional(),
  reminder_trigger_ms: z.number().optional(),
  reminder_max_count: z.number().optional(),
  ambient_sound: z.string().optional(),
  ambient_sound_volume: z.number().optional(),
  language: z.string().optional(),
  webhook_url: z.string().optional(),
  boosted_keywords: z.array(z.string()).optional(),
  enable_transcription_formatting: z.boolean().optional(),
  opt_out_sensitive_data_storage: z.boolean().optional(),
  opt_in_signed_url: z.boolean().optional(),
  pronunciation_dictionary: z
    .array(
      z.object({
        word: z.string(),
        alphabet: z.enum(["ipa", "cmu"]),
        phoneme: z.string(),
      })
    )
    .optional(),
  normalize_for_speech: z.boolean().optional(),
  end_call_after_silence_ms: z.number().optional(),
  max_call_duration_ms: z.number().optional(),
  enable_voicemail_detection: z.boolean().optional(),
  voicemail_message: z.string().optional(),
  voicemail_detection_timeout_ms: z.number().optional(),
  post_call_analysis_data: z.array(AnalysisDataSchema).optional(),
  post_call_analysis_model: z.enum(["gpt-4o-mini", "gpt-4o"]).optional(),
  begin_message_delay_ms: z.number().optional(),
  ring_duration_ms: z.number().optional(),
  stt_mode: z.enum(["fast", "accurate"]).optional(),
});

export const AgentOutputSchema = z.object({
  agent_id: z.string(),
  response_engine: z.object({
    type: z.literal("retell-llm"),
    llm_id: z.string(),
    version: z.number(),
  }),
  agent_name: z.string().optional(),
  version: z.number(),
  voice_id: z.string(),
  voice_model: z.string().optional(),
  fallback_voice_ids: z.array(z.string()).optional(),
  voice_temperature: z.number().optional(),
  voice_speed: z.number().optional(),
  volume: z.number().optional(),
  responsiveness: z.number().optional(),
  interruption_sensitivity: z.number().optional(),
  enable_backchannel: z.boolean().optional(),
  backchannel_frequency: z.number().optional(),
  backchannel_words: z.array(z.string()).optional(),
  reminder_trigger_ms: z.number().optional(),
  reminder_max_count: z.number().optional(),
  ambient_sound: z.string().optional(),
  ambient_sound_volume: z.number().optional(),
  language: z.string().optional(),
  webhook_url: z.string().optional(),
  boosted_keywords: z.array(z.string()).optional(),
  enable_transcription_formatting: z.boolean().optional(),
  opt_out_sensitive_data_storage: z.boolean().optional(),
  opt_in_signed_url: z.boolean().optional(),
  pronunciation_dictionary: z
    .array(
      z.object({
        word: z.string(),
        alphabet: z.enum(["ipa", "cmu"]),
        phoneme: z.string(),
      })
    )
    .optional(),
  normalize_for_speech: z.boolean().optional(),
  end_call_after_silence_ms: z.number().optional(),
  max_call_duration_ms: z.number().optional(),
  enable_voicemail_detection: z.boolean().optional(),
  voicemail_message: z.string().optional(),
  voicemail_detection_timeout_ms: z.number().optional(),
  post_call_analysis_data: z.array(AnalysisDataSchema).optional(),
  post_call_analysis_model: z.enum(["gpt-4o-mini", "gpt-4o"]).optional(),
  begin_message_delay_ms: z.number().optional(),
  ring_duration_ms: z.number().optional(),
  stt_mode: z.enum(["fast", "accurate"]).optional(),
  last_modification_timestamp: z.number(),
});

// ===== Phone Number Schemas =====

export const CreatePhoneNumberInputSchema = z.object({
  areaCode: z.number().describe("Area code of the number to obtain"),
  inboundAgentId: z.string().optional(),
  outboundAgentId: z.string().optional(),
  nickname: z.string().optional(),
  inboundWebhookUrl: z.string().optional(),
});

export const GetPhoneNumberInputSchema = z.object({
  phoneNumber: z.string().describe("The phone number to retrieve"),
});

export const UpdatePhoneNumberInputSchema = z.object({
  phoneNumber: z.string().describe("The phone number to update"),
  inboundAgentId: z.string().optional(),
  outboundAgentId: z.string().optional(),
  nickname: z.string().optional(),
  inboundWebhookUrl: z.string().optional(),
});

export const PhoneNumberOutputSchema = z.object({
  phone_number: z.string(),
  phone_number_pretty: z.string(),
  phone_number_type: z.string(),
  inbound_agent_id: z.string().nullable(),
  outbound_agent_id: z.string().nullable(),
  area_code: z.number(),
  nickname: z.string().nullable(),
  inbound_webhook_url: z.string().nullable(),
  last_modification_timestamp: z.number(),
});

// ===== Voice Schemas =====

export const GetVoiceInputSchema = z.object({
  voiceId: z.string().describe("The ID of the voice to retrieve"),
});

export const VoiceOutputSchema = z.object({
  voice_id: z.string(),
  voice_name: z.string(),
  provider: z.enum(["elevenlabs", "openai", "deepgram"]),
  accent: z.string().optional(),
  gender: z.enum(["male", "female"]),
  age: z.string().optional(),
});

// ===== Knowledge Base Schemas =====

export const CreateKnowledgeBaseInputSchema = z.object({
  name: z.string().describe("Name of the knowledge base"),
  description: z.string().optional(),
});

export const GetKnowledgeBaseInputSchema = z.object({
  knowledgeBaseId: z
    .string()
    .describe("The ID of the knowledge base to retrieve"),
});

export const AddKnowledgeBaseSourcesInputSchema = z.object({
  knowledgeBaseId: z.string().describe("The ID of the knowledge base"),
  sources: z
    .array(
      z.object({
        type: z.enum(["url", "text", "file"]).describe("Type of source"),
        url: z.string().optional().describe("URL for url type"),
        content: z.string().optional().describe("Text content for text type"),
        file_path: z.string().optional().describe("File path for file type"),
      })
    )
    .describe("Array of sources to add to the knowledge base"),
});

export const DeleteKnowledgeBaseInputSchema = z.object({
  knowledgeBaseId: z
    .string()
    .describe("The ID of the knowledge base to delete"),
});

export const DeleteKnowledgeBaseSourceInputSchema = z.object({
  knowledgeBaseId: z.string().describe("The ID of the knowledge base"),
  sourceId: z.string().describe("The ID of the source to delete"),
});

export const KnowledgeBaseOutputSchema = z.object({
  knowledge_base_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  created_at: z.number(),
  updated_at: z.number(),
  sources: z
    .array(
      z.object({
        source_id: z.string(),
        source_type: z.string(),
        status: z.string(),
        created_at: z.number(),
      })
    )
    .optional(),
});

// ===== Retell LLM Response Engine Schemas =====

export const CreateRetellLLMInputSchema = z.object({
  version: z.number().optional().describe("Version of the Retell LLM"),
  model: z
    .enum([
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "claude-3.7-sonnet",
      "claude-3.5-haiku",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ])
    .optional()
    .describe(
      "Select the underlying text LLM. If not set, would default to gpt-4o"
    ),
  s2s_model: z
    .enum(["gpt-4o-realtime", "gpt-4o-mini-realtime"])
    .optional()
    .describe(
      "Select the underlying speech to speech model. Can only set this or model, not both"
    ),
  model_temperature: z
    .number()
    .optional()
    .describe(
      "If set, will control the randomness of the response. Value ranging from [0,1]"
    ),
  model_high_priority: z
    .boolean()
    .optional()
    .describe(
      "If set to true, will use high priority pool with more dedicated resource"
    ),
  tool_call_strict_mode: z
    .boolean()
    .optional()
    .describe(
      "Only applicable when model is gpt-4o or gpt-4o mini. If set to true, will use structured output"
    ),
  general_prompt: z.string().describe(
    // "General prompt appended to system prompt no matter what state the agent is in"
    "Prompt for the agent to follow"
  ),
  general_tools: z
    .array(
      z.discriminatedUnion("type", [
        z.object({
          type: z.literal("end_call"),
          name: z.string(),
          description: z.string(),
        }),
        z.object({
          type: z.literal("transfer_call"),
          name: z.string(),
          description: z.string(),
          transfer_destination: z.discriminatedUnion("type", [
            z.object({
              type: z.literal("predefined"),
              value: z.enum(["voicemail", "operator"]),
              number: z.string(),
            }),
            z.object({
              type: z.literal("inferred"),
              description: z.string(),
              prompt: z.string(),
            }),
          ]),
        }),
        z.object({
          type: z.literal("check_availability_cal"),
          name: z.string(),
          description: z.string(),
          calendar_url: z.string(),
          cal_api_key: z.string(),
          event_type_id: z.number(),
        }),
        z.object({
          type: z.literal("book_appointment_cal"),
          name: z.string(),
          description: z.string(),
          calendar_url: z.string(),
          cal_api_key: z.string(),
          event_type_id: z.number(),
        }),
        z.object({
          type: z.literal("press_digit"),
          name: z.string(),
          description: z.string(),
          digit: z.string(),
        }),
        z.object({
          type: z.literal("custom"),
          name: z.string(),
          description: z.string(),
          speak_after_execution: z.boolean(),
          speak_during_execution: z.boolean(),
          url: z.string(),
        }),
      ])
    )
    .optional()
    .describe("A list of tools the model may call"),
  states: z
    .array(
      z.object({
        name: z.string(),
        state_prompt: z.string(),
        edges: z
          .array(
            z.object({
              destination_state_name: z.string(),
              description: z.string(),
              parameters: z
                .object({
                  type: z.literal("object"),
                  properties: z.record(z.any()),
                  required: z.array(z.string()),
                })
                .optional(),
            })
          )
          .optional(),
        tools: z
          .array(
            z.discriminatedUnion("type", [
              z.object({
                type: z.literal("end_call"),
                name: z.string(),
                description: z.string(),
              }),
              z.object({
                type: z.literal("transfer_call"),
                name: z.string(),
                description: z.string(),
                transfer_destination: z.discriminatedUnion("type", [
                  z.object({
                    type: z.literal("predefined"),
                    value: z.enum(["voicemail", "operator"]),
                    number: z.string(),
                  }),
                  z.object({
                    type: z.literal("inferred"),
                    description: z.string(),
                    prompt: z.string(),
                  }),
                ]),
              }),
              z.object({
                type: z.literal("check_availability_cal"),
                name: z.string(),
                description: z.string(),
                calendar_url: z.string(),
                cal_api_key: z.string(),
                event_type_id: z.number(),
              }),
              z.object({
                type: z.literal("book_appointment_cal"),
                name: z.string(),
                description: z.string(),
                calendar_url: z.string(),
                cal_api_key: z.string(),
                event_type_id: z.number(),
              }),
              z.object({
                type: z.literal("press_digit"),
                name: z.string(),
                description: z.string(),
                digit: z.string(),
              }),
              z.object({
                type: z.literal("custom"),
                name: z.string(),
                description: z.string(),
                speak_after_execution: z.boolean(),
                speak_during_execution: z.boolean(),
                url: z.string(),
              }),
            ])
          )
          .optional(),
      })
    )
    .optional()
    .describe("States of the LLM"),
  starting_state: z
    .string()
    .optional()
    .describe("Name of the starting state. Required if states is not empty"),
  begin_message: z
    .string()
    .optional()
    .describe("First utterance said by the agent in the call"),
  default_dynamic_variables: z
    .record(z.string())
    .optional()
    .describe(
      "Default dynamic variables represented as key-value pairs of strings"
    ),
  knowledge_base_ids: z
    .array(z.string())
    .optional()
    .describe("A list of knowledge base ids to use for this resource"),
});

export const GetRetellLLMInputSchema = z.object({
  llmId: z.string().describe("The ID of the Retell LLM to retrieve"),
});

export const UpdateRetellLLMInputSchema = z.object({
  llmId: z.string().describe("The ID of the Retell LLM to update"),
  version: z.number().optional(),
  model: z
    .enum([
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "claude-3.7-sonnet",
      "claude-3.5-haiku",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ])
    .optional(),
  s2s_model: z.enum(["gpt-4o-realtime", "gpt-4o-mini-realtime"]).optional(),
  model_temperature: z.number().optional(),
  model_high_priority: z.boolean().optional(),
  tool_call_strict_mode: z.boolean().optional(),
  general_prompt: z.string().optional(),
  general_tools: z
    .array(
      z.object({
        type: z.string(),
        name: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  // states: z
  //   .array(
  //     z.object({
  //       name: z.string(),
  //       state_prompt: z.string(),
  //       edges: z
  //         .array(
  //           z.object({
  //             destination_state_name: z.string(),
  //             description: z.string(),
  //             parameters: z
  //               .object({
  //                 type: z.literal("object"),
  //                 properties: z.record(z.any()),
  //                 required: z.array(z.string()),
  //               })
  //               .optional(),
  //           })
  //         )
  //         .optional(),
  //       tools: z
  //         .array(
  //           z.object({
  //             type: z.string(),
  //             name: z.string(),
  //             description: z.string(),
  //             parameters: z.record(z.any()).optional(),
  //           })
  //         )
  //         .optional(),
  //     })
  //   )
  //   .nullable()
  //   .optional(),
  // starting_state: z.string().nullable().optional(),
  begin_message: z.string().optional(),
  default_dynamic_variables: z.record(z.string()).optional(),
  knowledge_base_ids: z.array(z.string()).optional(),
});

export const RetellLLMOutputSchema = z.object({
  llm_id: z.string(),
  version: z.number(),
  model: z.string().nullable(),
  s2s_model: z.string().nullable(),
  model_temperature: z.number().optional(),
  model_high_priority: z.boolean().optional(),
  tool_call_strict_mode: z.boolean().optional(),
  general_prompt: z.string().nullable().optional(),
  general_tools: z
    .array(
      z.object({
        type: z.string(),
        name: z.string(),
        description: z.string(),
      })
    )
    .nullable()
    .optional(),
  // states: z
  //   .array(
  //     z.object({
  //       name: z.string(),
  //       state_prompt: z.string(),
  //       edges: z
  //         .array(
  //           z.object({
  //             destination_state_name: z.string(),
  //             description: z.string(),
  //             parameters: z
  //               .object({
  //                 type: z.literal("object"),
  //                 properties: z.record(z.any()),
  //                 required: z.array(z.string()),
  //               })
  //               .optional(),
  //           })
  //         )
  //         .optional(),
  //       tools: z
  //         .array(
  //           z.object({
  //             type: z.string(),
  //             name: z.string(),
  //             description: z.string(),
  //             parameters: z.record(z.any()).optional(),
  //           })
  //         )
  //         .optional(),
  //     })
  //   )
  //   .nullable()
  //   .optional(),
  // starting_state: z.string().nullable().optional(),
  begin_message: z.string().nullable().optional(),
  default_dynamic_variables: z.record(z.string()).nullable().optional(),
  knowledge_base_ids: z.array(z.string()).nullable().optional(),
  last_modification_timestamp: z.number(),
});

// ===== Conversation Flow Schemas =====

export const GetConversationFlowInputSchema = z.object({
  conversationFlowId: z
    .string()
    .describe("The ID of the conversation flow to retrieve"),
  version: z
    .number()
    .optional()
    .describe("Optional version number of the conversation flow to retrieve"),
});

export const UpdateConversationFlowInputSchema = z.object({
  conversationFlowId: z
    .string()
    .describe("The ID of the conversation flow to update"),
  // z.any() for nodes: flow nodes are deeply polymorphic (conversation, function_call,
  // press_digit, etc.) with different sub-schemas per type. The SDK has no typed support.
  nodes: z
    .array(z.any())
    .optional()
    .describe(
      "Array of flow nodes (conversation, function_call, press_digit, etc.). Each node has an id, type, and type-specific fields."
    ),
  global_prompt: z
    .string()
    .optional()
    .describe(
      "Global prompt appended to all conversation nodes in the flow"
    ),
  start_node_id: z
    .string()
    .optional()
    .describe("ID of the starting node in the flow"),
  default_dynamic_variables: z
    .record(z.string())
    .optional()
    .describe(
      "Default dynamic variables as key-value pairs of strings"
    ),
});

export const UpdateConversationFlowNodePromptInputSchema = z.object({
  conversationFlowId: z
    .string()
    .describe("The ID of the conversation flow containing the node"),
  nodeId: z
    .string()
    .describe("The ID of the specific node to update"),
  instruction: z
    .string()
    .describe(
      "The new instruction/prompt text for the node"
    ),
});

export const DeleteConversationFlowInputSchema = z.object({
  conversationFlowId: z
    .string()
    .describe("The ID of the conversation flow to delete"),
});

// ===== Batch Test Schemas =====

export const CreateBatchTestInputSchema = z.object({
  test_case_definition_ids: z
    .array(z.string())
    .min(1)
    .max(200)
    .describe("Array of test case definition IDs to run (1-200)"),
  response_engine: z
    .object({
      type: z.literal("retell-llm"),
      llm_id: z.string().describe("LLM model ID"),
      version: z.number().optional().describe("Pin to specific version"),
    })
    .optional()
    .describe("Optional response engine configuration with version pinning"),
});

export const GetBatchTestInputSchema = z.object({
  batchTestId: z.string().describe("The ID of the batch test to retrieve"),
});

export const CreateTestCaseInputSchema = z.object({
  name: z.string().describe("Name of the test case"),
  simulated_conversation: z
    .array(
      z.object({
        role: z.enum(["user", "agent"]).describe("Role in conversation"),
        content: z.string().describe("Message content"),
      })
    )
    .describe("Simulated conversation turns"),
  expected_variables: z
    .record(z.any())
    .optional()
    .describe("Expected variable values after test"),
  expected_node_path: z
    .array(z.string())
    .optional()
    .describe("Expected sequence of node IDs traversed"),
});

export const GetTestCaseInputSchema = z.object({
  testCaseId: z.string().describe("The ID of the test case to retrieve"),
});

export const UpdateTestCaseInputSchema = z.object({
  testCaseId: z.string().describe("The ID of the test case to update"),
  name: z.string().optional().describe("Updated name"),
  simulated_conversation: z
    .array(
      z.object({
        role: z.enum(["user", "agent"]),
        content: z.string(),
      })
    )
    .optional(),
  expected_variables: z.record(z.any()).optional(),
  expected_node_path: z.array(z.string()).optional(),
});

export const DeleteTestCaseInputSchema = z.object({
  testCaseId: z.string().describe("The ID of the test case to delete"),
});

// ===== Shared Component Schemas =====

export const CreateSharedComponentInputSchema = z.object({
  name: z.string().describe("Name of the shared component"),
  start_node_id: z.string().describe("Entry point node ID"),
  nodes: z
    .array(z.any())
    .describe(
      "Array of nodes in the component (same schema as flow nodes)"
    ),
});

export const GetSharedComponentInputSchema = z.object({
  componentId: z.string().describe("The ID of the shared component"),
});

export const UpdateSharedComponentInputSchema = z.object({
  componentId: z.string().describe("The ID of the shared component to update"),
  name: z.string().optional(),
  start_node_id: z.string().optional(),
  nodes: z.array(z.any()).optional(),
});

export const DeleteSharedComponentInputSchema = z.object({
  componentId: z.string().describe("The ID of the shared component to delete"),
});
