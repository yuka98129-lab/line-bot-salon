import Anthropic from "@anthropic-ai/sdk";
import type { FaqRow } from "@/lib/faq";

const MODEL = "claude-haiku-4-5-20251001";

let client: Anthropic | undefined;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });
  }

  return client;
}

export async function classifyCategory(
  message: string,
  categories: string[],
): Promise<string | null> {
  if (categories.length === 0) {
    return null;
  }

  const response = await getAnthropicClient().messages.create({
    model: MODEL,
    max_tokens: 256,
    system:
      "あなたは美容サロンのLINE botのメッセージを分類するアシスタントです。" +
      "ユーザーのメッセージが与えられたカテゴリ一覧のどれに該当するか判定してください。" +
      "どれにも明確に該当しない場合は category を null にしてください。",
    messages: [{ role: "user", content: message }],
    tools: [
      {
        name: "classify_category",
        description: "ユーザーのメッセージを分類する",
        input_schema: {
          type: "object",
          properties: {
            category: {
              type: ["string", "null"],
              enum: [...categories, null],
              description: "最も該当するカテゴリ。該当なしは null。",
            },
          },
          required: ["category"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "classify_category" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return null;
  }

  const input = toolUse.input as { category: string | null };
  return input.category ?? null;
}

export async function generateFaqAnswer(
  message: string,
  faqContext: FaqRow[],
): Promise<{ answer: string; confidence: "高" | "中" | "低" }> {
  const faqText =
    faqContext.length > 0
      ? faqContext
          .map((row) => `Q: ${row.question}\nA: ${row.answer}`)
          .join("\n\n")
      : "(該当するFAQがありません)";

  const response = await getAnthropicClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      "あなたは美容サロンのLINE公式アカウントのFAQ自動応答アシスタントです。" +
      "以下のFAQの内容だけを根拠にユーザーの質問に回答してください。FAQにない情報を推測や創作で補わないでください。\n\n" +
      "確信度の判定ルール:\n" +
      "- 高: FAQに質問と直接一致する記述があり、そのまま回答できる\n" +
      "- 中: FAQに関連する記述はあるが、完全には一致しない、または一部推測を含む\n" +
      "- 低: FAQに質問へ直接該当する記述がない、またはFAQと無関係な質問である\n" +
      "FAQに直接該当する記述がない場合は、必ず confidence を低にしてください。\n\n" +
      `## FAQ一覧\n${faqText}`,
    messages: [{ role: "user", content: message }],
    tools: [
      {
        name: "answer_faq",
        description: "FAQに基づいてユーザーの質問に回答する",
        input_schema: {
          type: "object",
          properties: {
            answer: {
              type: "string",
              description: "ユーザーへの回答文",
            },
            confidence: {
              type: "string",
              enum: ["高", "中", "低"],
              description: "回答の確信度",
            },
          },
          required: ["answer", "confidence"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "answer_faq" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured answer");
  }

  return toolUse.input as { answer: string; confidence: "高" | "中" | "低" };
}
