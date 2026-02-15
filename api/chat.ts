import type { VercelRequest, VercelResponse } from '@vercel/node';
import { VertexAI } from '@google-cloud/vertexai';

// Define function declarations for Vertex AI
const functionDeclarations: any[] = [
    {
        name: "createCalendarEvent",
        description: "Create a new event in the user's calendar. Use this when the user asks to schedule a meeting, appointment, or reminder.",
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "The title of the event (e.g., 'Meeting with Alice', 'Dentist Appointment')."
                },
                start: {
                    type: "string",
                    description: "The start time of the event in ISO 8601 format (e.g., '2023-10-27T14:00:00'). Calculate this based on the user's relative time request (e.g., 'tomorrow at 2pm') and the current reference time."
                },
                end: {
                    type: "string",
                    description: "The end time of the event in ISO 8601 format. If duration is not specified, assume 1 hour."
                },
                description: {
                    type: "string",
                    description: "Optional description or agenda for the event."
                },
                location: {
                    type: "string",
                    description: "Optional location for the event."
                }
            },
            required: ["title", "start", "end"]
        }
    },
    {
        name: "getCalendarEvents",
        description: "Get a list of calendar events for a specific time range to check availability or see what's on the schedule.",
        parameters: {
            type: "object",
            properties: {
                start: { type: "string", description: "Start time of the range to check (ISO 8601)." },
                end: { type: "string", description: "End time of the range to check (ISO 8601)." }
            },
            required: ["start", "end"]
        }
    }
];

// Store chat sessions in memory (per-instance, for demo)
const chatSessions = new Map<string, any>();

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, sessionId, context, action, functionResults } = req.body;

        // Get credentials from environment
        const projectId = process.env.VERTEX_AI_PROJECT_ID;
        const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

        if (!projectId) {
            return res.status(500).json({ error: 'Vertex AI not configured. Set VERTEX_AI_PROJECT_ID environment variable.' });
        }

        // Parse credentials if provided (for Vercel deployment)
        let credentials;
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
            try {
                credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
            } catch (e) {
                console.error('Failed to parse credentials JSON:', e);
            }
        }

        // Initialize Vertex AI
        const vertexAI = new VertexAI({
            project: projectId,
            location: location,
            googleAuthOptions: credentials ? { credentials } : undefined
        });

        // Get or create chat session
        let chatSession = chatSessions.get(sessionId);

        if (!chatSession || action === 'init') {
            // Create context string
            const currentDateTime = new Date().toLocaleString();
            const currentIso = new Date().toISOString();

            const contextString = `
        You are a helpful and intelligent assistant for a user in Myanmar.
        
        Current Date and Time: ${currentDateTime} (ISO: ${currentIso}).
        
        ${context?.financialContext || ''}
        
        Instructions:
        1. Helps with Finance: Budgeting, categorizing expenses, allocating MMK.
        2. Helps with Calendar: You can create events and check availability using the provided tools. 
        3. When creating events, ALWAYS convert relative terms like "tomorrow", "next Tuesday" into precise ISO 8601 datetime strings based on the 'Current Date' provided above.
        4. If a user asks "Am I free?", call 'getCalendarEvents' for that time period and analyze the results.
      `;

            const generativeModel = vertexAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
                systemInstruction: contextString,
                tools: [{
                    functionDeclarations: functionDeclarations
                }]
            });

            chatSession = generativeModel.startChat({});
            chatSessions.set(sessionId, chatSession);

            if (action === 'init') {
                return res.status(200).json({ success: true, message: 'Chat session initialized' });
            }
        }

        // If function results are provided, send them first
        if (functionResults && functionResults.length > 0) {
            const followUpResult = await chatSession.sendMessage(functionResults);
            const text = followUpResult.response.candidates?.[0]?.content?.parts?.[0]?.text || "Action completed.";

            return res.status(200).json({
                type: 'text',
                text: text
            });
        }

        // Send user message to Vertex AI
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const result = await chatSession.sendMessage(message);
        const response = result.response;

        // Check for function calls
        const functionCalls = response.candidates?.[0]?.content?.parts?.filter((part: any) => part.functionCall) || [];

        if (functionCalls.length > 0) {
            // Return function calls to frontend for execution
            return res.status(200).json({
                type: 'function_call',
                functionCalls: functionCalls.map((part: any) => ({
                    name: part.functionCall.name,
                    args: part.functionCall.args
                }))
            });
        } else {
            // Standard text response
            const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
            return res.status(200).json({
                type: 'text',
                text: text
            });
        }

    } catch (error: any) {
        console.error('Chat API error:', error);
        return res.status(500).json({
            error: 'Failed to process chat request',
            details: error.message
        });
    }
}
