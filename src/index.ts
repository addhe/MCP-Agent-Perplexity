#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ErrorCode,
	ListToolsRequestSchema,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// Read Perplexity API Key from environment variable (will be set in MCP config)
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
if (!PERPLEXITY_API_KEY) {
	// Log an error and exit if the key is missing.
	// Using console.error ensures this message goes to stderr and doesn't interfere with MCP communication.
	console.error('PERPLEXITY_API_KEY environment variable is required');
	process.exit(1); // Exit with a non-zero code to indicate failure
}

// --- Perplexity API Interaction Logic (Placeholder) ---
// We will add the actual API call logic here later.
async function queryPerplexity(prompt: string): Promise<string> {
	// Placeholder: Replace with actual Perplexity API call using axios
	console.error(`Querying Perplexity with prompt: ${prompt}`); // Log for debugging
	try {
		const response = await axios.post(
			'https://api.perplexity.ai/chat/completions',
			{
				model: 'sonar-reasoning', // Use model from documentation example
				messages: [
					{ role: 'system', content: 'Be precise and concise.' },
					{ role: 'user', content: prompt },
				],
			},
			{
				headers: {
					Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
					'Content-Type': 'application/json',
				},
			}
		);
		// Extract the response content
		return response.data?.choices?.[0]?.message?.content || 'No response from Perplexity.';
	} catch (error) {
		let errorMessage = 'Error querying Perplexity API.';
		if (axios.isAxiosError(error)) {
			errorMessage += ` Status: ${error.response?.status}, Data: ${JSON.stringify(error.response?.data)}`;
		} else if (error instanceof Error) {
			errorMessage += ` ${error.message}`;
		}
		console.error(errorMessage);
		// Return the error message to the client
		return errorMessage; 
	}
}

// Type guard for tool arguments
const isValidQueryArgs = (args: any): args is { prompt: string } =>
	typeof args === 'object' && args !== null && typeof args.prompt === 'string';

// --- MCP Server Implementation ---
class PerplexityServer {
	private server: Server;

	constructor() {
		this.server = new Server(
			{
				name: 'perplexity-server', // Unique name for this server
				version: '0.1.0',
			},
			{
				capabilities: {
					// No resources defined for this server, only tools
					resources: {}, 
					tools: {},
				},
			}
		);

		this.setupToolHandlers();

		// Basic error handling
		this.server.onerror = (error) => console.error('[MCP Error]', error);
		// Graceful shutdown
		process.on('SIGINT', async () => {
			await this.server.close();
			process.exit(0);
		});
	}

	private setupToolHandlers() {
		// Handler for listing available tools
		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools: [
				{
					name: 'query_perplexity', // Unique tool name
					description: 'Sends a query to the Perplexity API and returns the response.',
					inputSchema: {
						type: 'object',
						properties: {
							prompt: {
								type: 'string',
								description: 'The prompt/question to send to Perplexity.',
							},
						},
						required: ['prompt'],
					},
				},
			],
		}));

		// Handler for executing the 'query_perplexity' tool
		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			if (request.params.name !== 'query_perplexity') {
				throw new McpError(
					ErrorCode.MethodNotFound,
					`Unknown tool: ${request.params.name}`
				);
			}

			if (!isValidQueryArgs(request.params.arguments)) {
				throw new McpError(
					ErrorCode.InvalidParams,
					'Invalid arguments: "prompt" (string) is required.'
				);
			}

			const prompt = request.params.arguments.prompt;

			try {
				const result = await queryPerplexity(prompt);
				return {
					content: [{ type: 'text', text: result }], // Return the result from Perplexity
				};
			} catch (error) {
				// Log the error server-side
				console.error('Error calling queryPerplexity:', error); 
				// Return an error response to the client
				return {
					content: [
						{
							type: 'text',
							text: `Error processing Perplexity query: ${error instanceof Error ? error.message : 'Unknown error'}`,
						},
					],
					isError: true,
				};
			}
		});
	}

	async run() {
		// Use Stdio transport for local server communication
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		// Log to stderr that the server is running
		console.error('Perplexity MCP server running on stdio'); 
	}
}

// Instantiate and run the server
const server = new PerplexityServer();
server.run().catch((error) => {
	console.error('Failed to start Perplexity MCP server:', error);
	process.exit(1);
});