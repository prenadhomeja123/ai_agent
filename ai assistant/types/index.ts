// Lead types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  createdAt: string;
  lastContacted?: string;
  notes?: string;
  // New fields for MVP/Demo
  serviceType?: 'consultation' | 'coaching' | 'therapy' | 'session' | 'workshop' | 'other';
  price?: number;
  descriptionOfEnquiry?: string;
  potentialValue?: number;
}

// Message types
export interface Message {
  id: string;
  leadId: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'facebook' | 'instagram';
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  aiGenerated?: boolean;
}

// Automation types
export interface Automation {
  id: string;
  name: string;
  type: 'lead_followup' | 'booking_reminder' | 'confirmation' | 'post_session';
  enabled: boolean;
  trigger: string;
  lastTriggered?: string;
  timesTriggered: number;
}

// Agent Activity types
export interface AgentActivity {
  id: string;
  type: 'message_sent' | 'message_replied' | 'followup_triggered' | 'crm_updated' | 'automation_ran';
  description: string;
  channel?: string;
  leadId?: string;
  timestamp: string;
  details?: Record<string, any>;
}

// Settings types
export interface ChannelSettings {
  email: {
    enabled: boolean;
    provider?: string;
  };
  sms: {
    enabled: boolean;
    provider?: string;
  };
  whatsapp: {
    enabled: boolean;
    provider?: string;
  };
  facebook: {
    enabled: boolean;
    provider?: string;
  };
  instagram: {
    enabled: boolean;
    provider?: string;
  };
}

export interface CRMSettings {
  provider: string;
  connected: boolean;
  lastSynced?: string;
}

export interface AppSettings {
  channels: ChannelSettings;
  crm: CRMSettings;
  automations: {
    leadFollowup: boolean;
    bookingReminder: boolean;
    confirmation: boolean;
    postSession: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
}


