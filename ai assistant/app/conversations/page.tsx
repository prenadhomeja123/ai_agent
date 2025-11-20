'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  FiMail, 
  FiMessageSquare, 
  FiPhone, 
  FiSend, 
  FiFilter,
  FiSearch,
  FiArchive,
  FiCheckCircle,
  FiClock,
  FiX,
  FiZap,
  FiLoader,
} from 'react-icons/fi';
import { api } from '@/lib/api';
import { Lead, Message } from '@/types';

interface Conversation {
  lead: Lead;
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
  channel: string;
}

const CHANNEL_ICONS: { [key: string]: any } = {
  email: FiMail,
  sms: FiPhone,
  whatsapp: FiMessageSquare,
  facebook: FiMessageSquare,
  instagram: FiMessageSquare,
};

const CHANNEL_LABELS: { [key: string]: string } = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  instagram: 'Instagram',
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ongoing'); // ongoing, finished, archived
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout: Backend server may not be running. Please check if the server is running at http://localhost:8000'));
        }, 8000);
      });
      
      const [messagesData, leadsData] = await Promise.race([
        Promise.all([
          api.getMessages().catch(err => { console.error('Error fetching messages:', err); return []; }),
          api.getLeads().catch(err => { console.error('Error fetching leads:', err); return []; }),
        ]),
        timeoutPromise
      ]) as [Message[], Lead[]];

      // Ensure arrays
      const messages = Array.isArray(messagesData) ? messagesData : [];
      const leadsList = Array.isArray(leadsData) ? leadsData : [];

      console.log('[Conversations] Fetched data:', {
        messagesCount: messages.length,
        leadsCount: leadsList.length,
        sampleMessage: messages[0],
        sampleLead: leadsList[0]
      });

      setAllMessages(messages);
      setLeads(leadsList);

      // Group messages by lead and channel
      const conversationsMap = new Map<string, Conversation>();
      
      messages.forEach((message) => {
        // Handle both 'lead' (from backend) and 'leadId' (from type)
        const leadId = (message as any).lead || (message as any).leadId || message.leadId;
        
        if (!leadId) {
          console.warn('Message missing lead ID:', message);
          return;
        }
        
        const key = `${leadId}-${message.channel}`;
        
        // Try to find lead by ID (handle both string and number)
        let lead = leadsList.find(l => {
          const lId = String(l.id);
          const mId = String(leadId);
          return lId === mId || l.id === leadId;
        });
        
        // If not found, create a lead object from message data (backend provides lead_name and lead_email)
        if (!lead) {
          const leadName = (message as any).lead_name;
          const leadEmail = (message as any).lead_email;
          
          if (leadName || leadEmail) {
            lead = {
              id: String(leadId),
              name: leadName || 'Unknown Lead',
              email: leadEmail || '',
              status: 'new' as const,
              source: '',
              createdAt: new Date().toISOString(),
            };
          } else {
            console.warn('Message missing lead info:', message);
            return;
          }
        }
        
        if (!conversationsMap.has(key)) {
          conversationsMap.set(key, {
            lead,
            messages: [],
            lastMessage: message,
            unreadCount: 0,
            channel: message.channel,
          });
        }
        
        const conv = conversationsMap.get(key)!;
        conv.messages.push(message);
        
        // Update last message if this one is newer
        if (new Date(message.timestamp) > new Date(conv.lastMessage.timestamp)) {
          conv.lastMessage = message;
        }
        
        // Count unread (inbound messages that are not read)
        if (message.direction === 'inbound' && message.status !== 'read') {
          conv.unreadCount++;
        }
      });

      // Convert to array and sort by last message time
      const conversationsList = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());

      console.log('[Conversations] Created conversations:', {
        count: conversationsList.length,
        conversations: conversationsList.map(c => ({
          leadName: c.lead.name,
          channel: c.channel,
          messageCount: c.messages.length
        }))
      });

      setConversations(conversationsList);
      
      // Auto-select first conversation
      if (conversationsList.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationsList[0]);
      }
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations');
      setConversations([]);
      setAllMessages([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAISuggestion = async () => {
    if (!selectedConversation) return;

    try {
      setAiSuggesting(true);
      setAiSuggestion(null);
      
      // Build conversation history from messages
      const conversationHistory = selectedConversation.messages
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map(msg => ({
          role: msg.direction === 'inbound' ? 'user' : 'assistant',
          content: msg.content
        }));

      // Create a prompt for the AI
      const lastInboundMessage = [...selectedConversation.messages]
        .filter(m => m.direction === 'inbound')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      const prompt = lastInboundMessage 
        ? `Write a professional and helpful reply to this message from ${selectedConversation.lead.name}: "${lastInboundMessage.content}"`
        : `Write a professional follow-up message to ${selectedConversation.lead.name}`;

      const response = await api.generateAIResponse(prompt, {
        lead: {
          id: selectedConversation.lead.id,
          name: selectedConversation.lead.name,
          email: selectedConversation.lead.email
        },
        conversationHistory: conversationHistory
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setAiSuggestion(response.response || 'Could not generate suggestion');
    } catch (err: any) {
      console.error('Error generating AI suggestion:', err);
      alert('Failed to generate AI suggestion: ' + err.message);
      setAiSuggestion(null);
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleUseSuggestion = () => {
    if (aiSuggestion) {
      setReplyText(aiSuggestion);
      setAiSuggestion(null);
    }
  };

  const handleReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;

    try {
      setSending(true);
      
      const response = await api.sendMessage({
        leadId: selectedConversation.lead.id.toString(),
        channel: selectedConversation.channel,
        content: replyText,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh conversations
      await fetchData();
      setReplyText('');
      setAiSuggestion(null);
      
      // Update selected conversation
      const updatedMessages = await api.getMessages(selectedConversation.lead.id.toString());
      if (Array.isArray(updatedMessages)) {
        const updatedConv = {
          ...selectedConversation,
          messages: updatedMessages.filter((m: Message) => {
            const mChannel = (m as any).channel || m.channel;
            return mChannel === selectedConversation.channel;
          }),
        };
        setSelectedConversation(updatedConv);
      }
    } catch (err: any) {
      console.error('Error sending reply:', err);
      alert('Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const getConversationStatus = (conv: Conversation): 'ongoing' | 'finished' | 'archived' => {
    // For now, we'll use a simple heuristic:
    // - Ongoing: Last message within last 7 days
    // - Finished: Last message older than 7 days
    // - Archived: Not implemented yet (would need a field in Message model)
    const lastMessageDate = new Date(conv.lastMessage.timestamp);
    const daysSince = (Date.now() - lastMessageDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSince <= 7) {
      return 'ongoing';
    }
    return 'finished';
  };

  const filteredConversations = conversations.filter(conv => {
    // Status filter
    const status = getConversationStatus(conv);
    if (statusFilter !== 'all' && status !== statusFilter) {
      return false;
    }
    
    // Channel filter
    if (channelFilter !== 'all' && conv.channel !== channelFilter) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        conv.lead.name.toLowerCase().includes(searchLower) ||
        conv.lead.email.toLowerCase().includes(searchLower) ||
        conv.lastMessage.content.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const selectedMessages = selectedConversation 
    ? selectedConversation.messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    : [];

  // Debug: Log when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      console.log('[Conversations] Selected conversation:', {
        leadName: selectedConversation.lead.name,
        channel: selectedConversation.channel,
        messageCount: selectedConversation.messages.length,
        messages: selectedConversation.messages.map(m => ({
          id: m.id,
          content: m.content.substring(0, 50),
          direction: m.direction,
          timestamp: m.timestamp
        }))
      });
    }
  }, [selectedConversation]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
            <p className="text-sm text-gray-600 mt-1">Multi-channel inbox for all your messages</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex h-[calc(100vh-12rem)] gap-6">
          {/* Conversations List */}
          <div className="w-96 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setStatusFilter('ongoing')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'ongoing'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiClock className="inline w-4 h-4 mr-1" />
                  Ongoing
                </button>
                <button
                  onClick={() => setStatusFilter('finished')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'finished'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiCheckCircle className="inline w-4 h-4 mr-1" />
                  Finished
                </button>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
              </div>

              {/* Channel Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setChannelFilter('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    channelFilter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Channels
                </button>
                {['email', 'sms', 'whatsapp', 'facebook', 'instagram'].map((channel) => (
                  <button
                    key={channel}
                    onClick={() => setChannelFilter(channel)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      channelFilter === channel
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {CHANNEL_LABELS[channel] || channel}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FiMessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No conversations found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conv) => {
                    const ChannelIcon = CHANNEL_ICONS[conv.channel] || FiMessageSquare;
                    const isSelected = selectedConversation?.lead.id === conv.lead.id && 
                                      selectedConversation?.channel === conv.channel;
                    
                    return (
                      <button
                        key={`${conv.lead.id}-${conv.channel}`}
                        onClick={() => {
                          console.log('[Conversations] Clicked conversation:', {
                            leadName: conv.lead.name,
                            channel: conv.channel,
                            messageCount: conv.messages.length,
                            messages: conv.messages
                          });
                          setSelectedConversation(conv);
                        }}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <ChannelIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">{conv.lead.name}</span>
                            {conv.unreadCount > 0 && (
                              <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 capitalize">{conv.channel}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            conv.lastMessage.direction === 'inbound'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {conv.lastMessage.direction}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Conversation View */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedConversation.lead.name}
                      </h2>
                      <p className="text-sm text-gray-500">{selectedConversation.lead.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const ChannelIcon = CHANNEL_ICONS[selectedConversation.channel] || FiMessageSquare;
                        return <ChannelIcon className="w-5 h-5 text-gray-500" />;
                      })()}
                      <span className="text-sm text-gray-600 capitalize">
                        {CHANNEL_LABELS[selectedConversation.channel] || selectedConversation.channel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <p>No messages in this conversation</p>
                      <p className="text-xs mt-2 text-gray-400">
                        Conversation has {selectedConversation.messages.length} message(s) but none are displaying.
                        Check console for details.
                      </p>
                    </div>
                  ) : (
                    selectedMessages.map((message) => {
                      const ChannelIcon = CHANNEL_ICONS[message.channel] || FiMessageSquare;
                      const isInbound = message.direction === 'inbound';
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-2xl rounded-lg p-4 ${
                              isInbound
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-primary-600 text-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <ChannelIcon className={`w-4 h-4 ${isInbound ? 'text-gray-500' : 'text-primary-100'}`} />
                              <span className={`text-xs font-medium ${
                                isInbound ? 'text-gray-600' : 'text-primary-100'
                              }`}>
                                {isInbound ? 'From' : 'To'} {selectedConversation.lead.name}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs ${
                                isInbound ? 'text-gray-500' : 'text-primary-100'
                              }`}>
                                {new Date(message.timestamp).toLocaleString()}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                message.status === 'sent' || message.status === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : message.status === 'read'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {message.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* AI Suggestion */}
                {aiSuggestion && (
                  <div className="p-4 border-t border-gray-200 bg-blue-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FiZap className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">AI Suggestion</span>
                      </div>
                      <button
                        onClick={() => setAiSuggestion(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{aiSuggestion}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUseSuggestion}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Use Suggestion
                      </button>
                      <button
                        onClick={handleGenerateAISuggestion}
                        disabled={aiSuggesting}
                        className="px-4 py-2 bg-white text-blue-600 text-sm rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>
                )}

                {/* Reply Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={handleGenerateAISuggestion}
                      disabled={aiSuggesting || !selectedConversation}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      title="Get AI suggestion for reply"
                    >
                      {aiSuggesting ? (
                        <>
                          <FiLoader className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Generating...</span>
                        </>
                      ) : (
                        <>
                          <FiZap className="w-4 h-4" />
                          <span className="text-sm">AI Suggest</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                      placeholder={`Reply via ${CHANNEL_LABELS[selectedConversation.channel] || selectedConversation.channel}...`}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={sending}
                    />
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim() || sending}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <FiSend className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send • AI powered by Google Gemini
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FiMessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="mb-2">Select a conversation to view messages</p>
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200 max-w-md mx-auto">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <FiZap className="w-5 h-5 text-purple-600" />
                      <p className="text-sm font-medium text-purple-900">AI Assistant Available</p>
                    </div>
                    <p className="text-xs text-purple-700">
                      Once you select a conversation, you'll see the "AI Suggest" button to get AI-powered reply suggestions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

