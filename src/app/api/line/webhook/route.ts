import { NextRequest, NextResponse } from "next/server";
import { messagingApi, validateSignature, type webhook } from "@line/bot-sdk";
import { classifyCategory, generateFaqAnswer } from "@/lib/claude";
import { getFaqCategories, searchFaq } from "@/lib/faq";
import { notifyOwnerOfLowConfidence } from "@/lib/notifyOwner";
import { getSupabaseServerClient } from "@/lib/supabase";

const channelSecret = process.env.LINE_CHANNEL_SECRET ?? "";
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";

const client = new messagingApi.MessagingApiClient({ channelAccessToken });

const FALLBACK_REPLY =
  "只今回答を生成できませんでした。担当者が確認の上、あらためてご連絡いたします。";

const CONFIDENCE_SCORE: Record<"高" | "中" | "低", number> = {
  高: 1,
  中: 0.5,
  低: 0,
};

async function insertConversation(params: {
  lineUserId: string;
  message: string;
  botResponse: string | null;
  confidence: number | null;
  escalated: boolean;
}) {
  const { error } = await getSupabaseServerClient().from("conversations").insert({
    line_user_id: params.lineUserId,
    message: params.message,
    bot_response: params.botResponse,
    confidence: params.confidence,
    escalated: params.escalated,
  });

  if (error) {
    console.error("Failed to log conversation", error);
  }
}

async function handleEvent(event: webhook.Event) {
  if (event.type !== "message" || event.message.type !== "text" || !event.replyToken) {
    return;
  }

  const userMessage = event.message.text;
  const lineUserId =
    event.source && "userId" in event.source ? event.source.userId ?? "unknown" : "unknown";

  let replyText = FALLBACK_REPLY;
  let confidence: "高" | "中" | "低" | null = null;

  try {
    const categories = await getFaqCategories();
    const category = await classifyCategory(userMessage, categories);
    const faqContext = await searchFaq(category);
    const result = await generateFaqAnswer(userMessage, faqContext);

    confidence = result.confidence;
    replyText =
      result.confidence === "低"
        ? `${result.answer}\n\n担当者が確認の上、あらためてご連絡いたします。`
        : result.answer;
  } catch (error) {
    console.error("Failed to generate FAQ answer", error);
  }

  await client.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: "text", text: replyText }],
  });

  const needsEscalation = confidence === "低" || confidence === null;

  await Promise.allSettled([
    needsEscalation
      ? notifyOwnerOfLowConfidence({ userMessage, botAnswer: replyText, lineUserId })
      : Promise.resolve(),
    insertConversation({
      lineUserId,
      message: userMessage,
      botResponse: replyText,
      confidence: confidence ? CONFIDENCE_SCORE[confidence] : null,
      escalated: needsEscalation,
    }),
  ]);
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
