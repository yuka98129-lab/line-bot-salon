import Link from "next/link";
import { createFaqAction } from "../actions";

export default async function NewFaqPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-bold">FAQを追加</h2>

      {error && (
        <p className="text-red-700 text-sm" role="alert">
          {error === "required" ? "質問と回答は必須です。" : "保存に失敗しました。もう一度お試しください。"}
        </p>
      )}

      <form action={createFaqAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold">カテゴリ(任意)</span>
          <input
            name="category"
            type="text"
            placeholder="例: 料金、予約、アクセス"
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-base"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold">質問</span>
          <textarea
            name="question"
            required
            rows={2}
            className="rounded-lg border border-gray-300 p-3 text-base"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold">回答</span>
          <textarea
            name="answer"
            required
            rows={5}
            className="rounded-lg border border-gray-300 p-3 text-base"
          />
        </label>

        <div className="flex gap-2">
          <Link
            href="/admin/faq"
            className="min-h-12 flex-1 flex items-center justify-center rounded-lg border border-gray-300 text-sm font-medium"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            className="min-h-12 flex-1 rounded-lg bg-blue-600 text-white font-bold text-sm active:bg-blue-700"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
}
