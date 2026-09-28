import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import DeleteButton from "@/components/DeleteButton";
import { deleteFaqAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function FaqListPage() {
  const { data, error } = await getSupabaseServerClient()
    .from("faq")
    .select("id, question, answer, category")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">FAQ一覧</h2>
        <Link
          href="/admin/faq/new"
          className="min-h-11 px-4 flex items-center rounded-lg bg-blue-600 text-white text-sm font-bold active:bg-blue-700"
        >
          + 追加
        </Link>
      </div>

      {error && (
        <p className="text-red-700 text-sm">読み込みに失敗しました: {error.message}</p>
      )}

      {!error && (data?.length ?? 0) === 0 && (
        <p className="text-gray-500 text-sm">まだFAQが登録されていません。「+ 追加」から登録できます。</p>
      )}

      <ul className="flex flex-col gap-3">
        {(data ?? []).map((row) => (
          <li key={row.id} className="rounded-lg border border-gray-200 bg-white p-4">
            {row.category && (
              <span className="inline-block text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5 mb-2">
                {row.category}
              </span>
            )}
            <p className="font-bold text-sm break-words">{row.question}</p>
            <p className="text-sm text-gray-600 mt-1 break-words whitespace-pre-wrap">
              {row.answer}
            </p>
            <div className="flex gap-2 mt-3">
              <Link
                href={`/admin/faq/${row.id}/edit`}
                className="min-h-11 px-4 flex-1 flex items-center justify-center rounded-lg border border-gray-300 text-sm font-medium"
              >
                編集
              </Link>
              <DeleteButton id={row.id} action={deleteFaqAction} label="このFAQ" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
