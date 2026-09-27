import { NextRequest, NextResponse } from "next/server";
import { messagingApi, validateSignature, type webhook } from "@line/bot-sdk";

const channelSecret = process.env.LINE_CHANNEL_SECRET ?? "";
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";

const client = new messagingApi.MessagingApiClient({ channelAccessToken });

async function handleEvent(event: webhook.Event) {
  if (event.type !== "message" || event.message.type !== "text" || !event.replyToken) {
    return;
  }

  await client.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: "text", text: event.message.text }],
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature") ?? "";

  if (!validateSignature(body, channelSecret, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const { events } = JSON.parse(body) as { events: webhook.Event[] };
  await Promise.all(events.map(handleEvent));

  return NextResponse.json({ status: "ok" });
}
