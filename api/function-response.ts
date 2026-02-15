import type { VercelRequest, VercelResponse } from '@vercel/node';

// Handle function response from frontend
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
        const { sessionId, functionResponses } = req.body;

        if (!sessionId || !functionResponses) {
            return res.status(400).json({ error: 'SessionId and functionResponses are required' });
        }

        // Import chat handler to access sessions
        const { chatSessions } = await import('./chat');
        const chatSession = chatSessions?.get(sessionId);

        if (!chatSession) {
            return res.status(400).json({ error: 'Chat session not found' });
        }

        // Send function response back to Vertex AI
        const result = await chatSession.sendMessage(functionResponses);
        const response = result.response;

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "Action completed.";

        return res.status(200).json({
            type: 'text',
            text: text
        });

    } catch (error: any) {
        console.error('Function response error:', error);
        return res.status(500).json({
            error: 'Failed to process function response',
            details: error.message
        });
    }
}
