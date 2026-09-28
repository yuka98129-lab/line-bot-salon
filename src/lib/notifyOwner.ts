import { messagingApi } from "@line/bot-sdk";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
const ownerLineUserId = process.env.OWNER_LINE_USER_ID ?? "";

const client = new messagingApi.MessagingApiClient({ channelAccessToken });

export async function notifyOwnerOfLowConfidence(params: {
  userMessage: string;
  botAnswer: string;
  lineUserId: string;
}): Promise<void> {
  if (!ownerLineUserId) {
    console.error("OWNER_LINE_USER_ID is not set; skipping owner notification");
    return;
  }

  const text =
    "【要確認】確信度の低い自動応答がありました\n\n" +
    `お客様: ${params.lineUserId}\n` +
    `質問: ${params.userMessage}\n` +
    `bot回答: ${params.botAnswer}`;

  try {
    await client.pushMessage({
      to: ownerLineUserId,
      messages: [{ type: "text", text }],
    });
  } catch (error) {
    console.error("Failed to notify owner of low-confidence answer", error);
  }
}
