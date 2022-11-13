export type SMSProvider = {
  name: string;
  isAvailable: boolean;
  sendMessage(to: string, body: string): Promise<boolean>;
};
