import React, { useState, useRef, useEffect } from 'react';
import { Account, Transaction, ChatMessage, CalendarEvent } from '../types';
import { GoogleGenAI, GenerateContentResponse, Chat as GeminiChat, FunctionDeclaration, Type, Tool, Part } from "@google/genai";
import { formatCurrency, generateId } from '../utils';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatProps {
  accounts: Account[];
  transactions: Transaction[];
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
}

export default function Chat({ accounts, transactions, events, onAddEvent }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I am your AI assistant. I can help you manage your finances and your schedule. Try asking me to "Schedule a meeting with John tomorrow at 2 PM" or ask "Am I free on Friday?".',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatSessionRef = useRef<GeminiChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Define Function Declarations (Tools)
  const createCalendarEvent: FunctionDeclaration = {
    name: "createCalendarEvent",
    description: "Create a new event in the user's calendar. Use this when the user asks to schedule a meeting, appointment, or reminder.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "The title of the event (e.g., 'Meeting with Alice', 'Dentist Appointment')."
        },
        start: {
          type: Type.STRING,
          description: "The start time of the event in ISO 8601 format (e.g., '2023-10-27T14:00:00'). Calculate this based on the user's relative time request (e.g., 'tomorrow at 2pm') and the current reference time."
        },
        end: {
          type: Type.STRING,
          description: "The end time of the event in ISO 8601 format. If duration is not specified, assume 1 hour."
        },
        description: {
          type: Type.STRING,
          description: "Optional description or agenda for the event."
        },
        location: {
          type: Type.STRING,
          description: "Optional location for the event."
        }
      },
      required: ["title", "start", "end"]
    }
  };

  const getCalendarEvents: FunctionDeclaration = {
    name: "getCalendarEvents",
    description: "Get a list of calendar events for a specific time range to check availability or see what's on the schedule.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            start: { type: Type.STRING, description: "Start time of the range to check (ISO 8601)." },
            end: { type: Type.STRING, description: "End time of the range to check (ISO 8601)." }
        },
        required: ["start", "end"]
    }
  };

  const tools: Tool[] = [{ functionDeclarations: [createCalendarEvent, getCalendarEvents] }];

  // Initialize Gemini Chat
  useEffect(() => {
    const initChat = async () => {
      try {
        const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
        const currentDateTime = new Date().toLocaleString();
        const currentIso = new Date().toISOString();
        
        const contextString = `
          You are a helpful and intelligent assistant for a user in Myanmar.
          
          Current Date and Time: ${currentDateTime} (ISO: ${currentIso}).
          
          Financial Context:
          - Total Balance: ${formatCurrency(totalBalance)}
          - Accounts: ${accounts.map(a => `${a.name} (${a.type}): ${formatCurrency(a.balance)}`).join(', ')}
          
          Instructions:
          1. Helps with Finance: Budgeting, categorizing expenses, allocating MMK.
          2. Helps with Calendar: You can create events and check availability using the provided tools. 
          3. When creating events, ALWAYS convert relative terms like "tomorrow", "next Tuesday" into precise ISO 8601 datetime strings based on the 'Current Date' provided above.
          4. If a user asks "Am I free?", call 'getCalendarEvents' for that time period and analyze the results.
        `;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: contextString,
            tools: tools
          },
        });
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initChat();
  }, [accounts]); // Re-init if accounts change, though usually just once is enough

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSessionRef.current) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: input });
      
      // Check for function calls
      const calls = result.functionCalls;
      
      if (calls && calls.length > 0) {
        // Handle Function Calls
        // We map each call to a Part containing the function response
        const responseParts: Part[] = [];
        
        for (const call of calls) {
            let apiResponse = {};
            
            if (call.name === 'createCalendarEvent') {
                const args = call.args as any;
                const newEvent: CalendarEvent = {
                    id: generateId(),
                    title: args.title,
                    start: args.start,
                    end: args.end,
                    type: 'local',
                    description: args.description || '',
                    location: args.location || '',
                    color: '#3b82f6' // Blue
                };
                
                // Execute the action in the app
                onAddEvent(newEvent);
                apiResponse = { result: "Event created successfully.", event: newEvent };
            } 
            else if (call.name === 'getCalendarEvents') {
                const args = call.args as any;
                const startRange = new Date(args.start);
                const endRange = new Date(args.end);
                
                // Filter events within range
                const foundEvents = events.filter(e => {
                    const eStart = new Date(e.start);
                    return eStart >= startRange && eStart <= endRange;
                });
                
                apiResponse = { 
                    result: foundEvents.length > 0 ? "Events found." : "No events found (User is free).",
                    events: foundEvents.map(e => ({ title: e.title, start: e.start, end: e.end }))
                };
            }

            responseParts.push({
                functionResponse: {
                    name: call.name,
                    response: apiResponse,
                    id: call.id
                }
            });
        }

        // Send function execution result back to the model
        // Fix: Use 'message' property with array of Parts
        const savedResponse = await chatSessionRef.current.sendMessage({
             message: responseParts
        });
        
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: savedResponse.text || "Action completed.",
            timestamp: Date.now()
        }]);

      } else {
        // Standard Text Response
        if (result.text) {
             setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: result.text,
                timestamp: Date.now()
             }]);
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error processing your request.",
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <div className="bg-white dark:bg-slate-800 rounded-t-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 dark:text-white">Personal Assistant</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-emerald-600 text-white'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : msg.isError 
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-tl-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
               <div className="flex space-x-1">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 rounded-b-2xl">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Schedule lunch with John tomorrow at 12pm..."
            className="w-full bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={isThinking}
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}