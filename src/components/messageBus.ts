export type SidePanelPayload = {
  sender: string;
  message: string;
  submittedAt: string;
};

const CHANNEL_NAME = "gmeet-poc-channel";

export function createMessageChannel() {
  return new BroadcastChannel(CHANNEL_NAME);
}
