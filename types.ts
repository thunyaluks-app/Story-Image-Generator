
export type MessageTone = 'Professional' | 'Friendly' | 'Persuasive' | 'Empathetic' | 'Casual' | 'Urgent';

export type MessagePlatform = 'Email' | 'Slack/Teams' | 'Social Media' | 'SMS' | 'LinkedIn';

export interface WritingState {
  originalText: string;
  refinedText: string;
  tone: MessageTone;
  platform: MessagePlatform;
  isProcessing: boolean;
}

export interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
}
