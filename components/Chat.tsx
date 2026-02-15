import React, { useState, useRef, useEffect } from 'react';
import { Account, Transaction, ChatMessage, CalendarEvent } from '../types';
import { formatCurrency, generateId } from '../utils';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatProps {
  accounts: Account[];
  transactions: Transaction[];
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  isGoogleConnected?: boolean;
  onCreateGoogleEvent?: (event: CalendarEvent) => Promise<CalendarEvent>;
}

export default function Chat({ accounts, transactions, events, onAddEvent, isGoogleConnected, onCreateGoogleEvent }: ChatProps) {
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
  const sessionIdRef = useRef<string>(`session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Initialize chat session on mount
  useEffect(() => {
    const initChat = async () => {
      try {
        const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
        const financialContext = `
          Financial Context:
          - Total Balance: ${formatCurrency(totalBalance)}
          - Accounts: ${accounts.map(a => `${a.name} (${a.type}): ${formatCurrency(a.balance)}`).join(', ')}
        `;

        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'init',
            sessionId: sessionIdRef.current,
            context: { financialContext }
          })
        });

        if (!response.ok) {
          console.error('Failed to initialize chat session');
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initChat();
  }, [accounts]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

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
      const apiUrl = import.meta.env.VITE_API_URL || '';

      // Send message to backend
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId: sessionIdRef.current
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.type === 'function_call') {
        // Handle function calls
        const functionResponses = [];

        for (const call of result.functionCalls) {
          let apiResponse = {};

          if (call.name === 'createCalendarEvent') {
            const args = call.args;
            const newEvent: CalendarEvent = {
              id: generateId(),
              title: args.title,
              start: args.start,
              end: args.end,
              type: 'local',
              description: args.description || '',
              location: args.location || '',
              color: '#3b82f6'
            };

            // Try to create in Google Calendar if connected
            if (isGoogleConnected && onCreateGoogleEvent) {
              try {
                const googleEvent = await onCreateGoogleEvent(newEvent);
                apiResponse = {
                  result: "Event created successfully in Google Calendar.",
                  event: googleEvent
                };
              } catch (error) {
                console.error('Failed to create Google Calendar event, falling back to local:', error);
                // Fall back to local event
                onAddEvent(newEvent);
                apiResponse = {
                  result: "Event created locally (Google Calendar sync failed).",
                  event: newEvent
                };
              }
            } else {
              // Create local event
              onAddEvent(newEvent);
              apiResponse = {
                result: "Event created successfully in your local calendar.",
                event: newEvent
              };
            }
          }
          else if (call.name === 'getCalendarEvents') {
            const args = call.args;
            const startRange = new Date(args.start);
            const endRange = new Date(args.end);

            const foundEvents = events.filter(e => {
              const eStart = new Date(e.start);
              return eStart >= startRange && eStart <= endRange;
            });

            apiResponse = {
              result: foundEvents.length > 0 ? "Events found." : "No events found (User is free).",
              events: foundEvents.map(e => ({ title: e.title, start: e.start, end: e.end }))
            };
          }

          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: apiResponse
            }
          });
        }

        // Send function responses back to the SAME endpoint
        const followUpResponse = await fetch(`${apiUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            functionResults: functionResponses
          })
        });

        if (!followUpResponse.ok) {
          throw new Error('Failed to send function response');
        }

        const followUpResult = await followUpResponse.json();

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: followUpResult.text,
          timestamp: Date.now()
        }]);

      } else if (result.type === 'text') {
        // Standard text response
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: result.text,
          timestamp: Date.now()
        }]);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error processing your request. Make sure the API is configured correctly.",
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
          <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini AI (Vertex AI)</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-emerald-600 text-white'
              }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
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