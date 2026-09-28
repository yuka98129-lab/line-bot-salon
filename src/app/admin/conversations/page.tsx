import { getSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const escalatedOnly = filter === "escalated";

  let query = getSupabaseServerClient()
    .from("conversations")
    .select("id, line_user_id, message, bot_response, confidence, escalated, created_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (escalatedOnly) {
    query = query.eq("escalated", true);
  }

  const { data, error } = await query;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-bold">会話ログ</h2>

      <div className="flex gap-2 text-sm">
        <a
          href="/admin/conversations"
          className={`min-h-10 px-3 flex items-center rounded-full border ${
            !escalatedOnly
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-300 text-gray-700"
          }`}
        >
          すべて
        </a>
        <a
          href="/admin/conversations?filter=escalated"
          className={`min-h-10 px-3 flex items-center rounded-full border ${
            escalatedOnly
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-300 text-gray-700"
          }`}
        >
          要確認のみ
        </a>
      </div>

      {error && (
        <p className="text-red-700 text-sm">読み込みに失敗しました: {error.message}</p>
      )}

      {!error && (data?.length ?? 0) === 0 && (
        <p className="text-gray-500 text-sm">
          {escalatedOnly ? "要確認の会話はありません。" : "まだ会話ログがありません。"}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {(data ?? []).map((row) => (
          <li key={row.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-xs text-gray-500">
                {new Date(row.created_at).toLocaleString("ja-JP")}
              </span>
              {row.escalated && (
                <span className="text-xs bg-amber-100 text-amber-800 rounded px-2 py-0.5 font-medium shrink-0">
                  要確認
                </span>
              )}
            </div>
            <p className="text-sm break-words">
              <span className="font-bold">お客様: </span>
              {row.message}
            </p>
            <p className="text-sm mt-1 text-gray-700 break-words">
              <span className="font-bold">bot: </span>
              {row.bot_response ?? "(回答なし)"}
            </p>
          </li>
        ))}
      </ul>

      {(data?.length ?? 0) === PAGE_SIZE && (
        <p className="text-xs text-gray-400 text-center">
          最新{PAGE_SIZE}件を表示しています
        </p>
      )}
    </div>
  );
}
