const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";

/**
 * LINE公式アカウントの友だち全員にテキストメッセージを一斉配信する。
 * https://developers.line.biz/ja/reference/messaging-api/#send-broadcast-message
 */
export async function broadcastTextMessage(text: string): Promise<void> {
  const response = await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      messages: [{ type: "text", text }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LINE broadcast failed: ${response.status} ${body}`);
  }
}
