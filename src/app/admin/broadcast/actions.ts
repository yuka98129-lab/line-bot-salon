"use server";

import { broadcastTextMessage } from "@/lib/lineBroadcast";

const MAX_LENGTH = 1000;

export async function sendBroadcastAction(
  text: string,
): Promise<{ ok: boolean; message: string }> {
  const trimmed = text.trim();

  if (!trimmed) {
    return { ok: false, message: "本文を入力してください。" };
  }

  if (trimmed.length > MAX_LENGTH) {
    return { ok: false, message: `本文が長すぎます(${MAX_LENGTH}文字以内にしてください)。` };
  }

  try {
    await broadcastTextMessage(trimmed);
    return { ok: true, message: "送信しました。" };
  } catch (error) {
    console.error("Failed to send broadcast", error);
    return { ok: false, message: "送信に失敗しました。時間をおいて再度お試しください。" };
  }
}
