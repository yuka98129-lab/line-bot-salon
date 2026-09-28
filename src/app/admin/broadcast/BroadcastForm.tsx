"use client";

import { useState, useTransition } from "react";
import Spinner from "@/components/Spinner";
import { sendBroadcastAction } from "./actions";

const MAX_LENGTH = 1000;

export default function BroadcastForm() {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    const confirmed = window.confirm(
      `LINEの友だち全員に、このメッセージを送信します。この操作は取り消せません。よろしいですか?\n\n${trimmed}`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      const res = await sendBroadcastAction(trimmed);
      setResult(res);
      if (res.ok) setText("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-bold">お知らせの内容</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={6}
          maxLength={MAX_LENGTH}
          placeholder="例: 本日は臨時休業とさせていただきます。"
          disabled={isPending}
          className="rounded-lg border border-gray-300 p-3 text-base"
        />
        <span className="text-xs text-gray-400 text-right">
          {text.length} / {MAX_LENGTH}
        </span>
      </label>

      <button
        type="submit"
        disabled={isPending || !text.trim()}
        className="min-h-12 rounded-lg bg-blue-600 text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 active:bg-blue-700"
      >
        {isPending && <Spinner />}
        {isPending ? "送信中..." : "友だち全員に送信"}
      </button>

      {result && (
        <p
          role="status"
          className={`text-sm text-center ${result.ok ? "text-green-700" : "text-red-700"}`}
        >
          {result.message}
        </p>
      )}
    </form>
  );
}
