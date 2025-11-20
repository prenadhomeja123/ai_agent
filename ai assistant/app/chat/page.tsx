'use client';

import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { FiSend, FiLoader } from 'react-icons/fi';
import { Lead, Message } from '@/types';
import { api } from '@/lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  leadId?: string;
  channel?: string;
}

export default function ChatPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchLeads = async () => {
      const mockLeads: Lead[] = [
        { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'new', source: 'Website', createdAt: '2024-01-15' },
        { id: '2', name: 'Mike Chen', email: 'mike@example.com', status: 'contacted', source: 'Referral', createdAt: '2024-01-14' },
        { id: '3', name: 'Emily Davis', email: 'emily@example.com', status: 'qualified', source: 'Social Media', createdAt: '2024-01-13' },
      ];
      setLeads(mockLeads);
      if (mockLeads.length > 0) {
        setSelectedLead(mockLeads[0]);
      }
    };
    fetchLeads();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedLead) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call the actual AI API with conversation history
      const response = await api.generateAIResponse(input, { 
        lead: {
          id: selectedLead.id,
          name: selectedLead.name,
          email: selectedLead.email
        },
        conversationHistory: conversationHistory
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response || 'Sorry, I could not generate a response.',
        timestamp: new Date().toISOString(),
        leadId: selectedLead.id,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      // Show error message to user
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to generate AI response. Please try again.'}`,
        timestamp: new Date().toISOString(),
        leadId: selectedLead.id,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (channel: string) => {
    if (!selectedLead || messages.length === 0) return;
    
    const lastAIMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastAIMessage) return;

    try {
      // TODO: Replace with actual API call
      // await api.sendMessage({
      //   leadId: selectedLead.id,
      //   channel,
      //   content: lastAIMessage.content,
      // });
      
      alert(`Message sent via ${channel} to ${selectedLead.name}`);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* Leads Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads</h2>
          <div className="space-y-2">
            {leads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => {
                  setSelectedLead(lead);
                  setMessages([]);
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedLead?.id === lead.id
                    ? 'bg-primary-50 border-2 border-primary-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <p className="font-medium text-gray-900">{lead.name}</p>
                <p className="text-sm text-gray-500">{lead.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                  lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {lead.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedLead ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedLead.name}</h2>
                    <p className="text-sm text-gray-500">{selectedLead.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={previewMode}
                        onChange={(e) => setPreviewMode(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>Preview Mode</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <p>Start a conversation with {selectedLead.name}</p>
                    <p className="text-sm mt-2">The AI will help you craft personalized messages</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-2xl rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                      {message.role === 'assistant' && previewMode && (
                        <div className="mt-4 pt-4 border-t border-gray-300">
                          <p className="text-xs font-medium text-gray-700 mb-2">Send via:</p>
                          <div className="flex space-x-2">
                            {['email', 'sms', 'whatsapp'].map((channel) => (
                              <button
                                key={channel}
                                onClick={() => handleSendMessage(channel)}
                                className="px-3 py-1 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                              >
                                {channel.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <FiLoader className="w-5 h-5 animate-spin text-gray-500" />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Ask AI to help craft a message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Powered by Google Gemini
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a lead to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


