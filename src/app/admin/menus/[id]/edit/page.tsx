import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import DeleteButton from "@/components/DeleteButton";
import { updateMenuAction, deleteMenuAction } from "../../actions";

export default async function EditMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const { data, error: fetchError } = await getSupabaseServerClient()
    .from("menus")
    .select("id, name, price, description")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !data) {
    notFound();
  }

  const updateWithId = updateMenuAction.bind(null, id);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-bold">メニューを編集</h2>

      {error && (
        <p className="text-red-700 text-sm" role="alert">
          {error === "required" ? "メニュー名と料金は必須です。" : "保存に失敗しました。もう一度お試しください。"}
        </p>
      )}

      <form action={updateWithId} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold">メニュー名</span>
          <input
            name="name"
            type="text"
            required
            defaultValue={data.name}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-base"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold">料金(円)</span>
          <input
            name="price"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            required
            defaultValue={data.price}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-base"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold">説明(任意)</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={data.description ?? ""}
            className="rounded-lg border border-gray-300 p-3 text-base"
          />
        </label>

        <div className="flex gap-2">
          <Link
            href="/admin/menus"
            className="min-h-12 flex-1 flex items-center justify-center rounded-lg border border-gray-300 text-sm font-medium"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            className="min-h-12 flex-1 rounded-lg bg-blue-600 text-white font-bold text-sm active:bg-blue-700"
          >
            更新
          </button>
        </div>
      </form>

      <DeleteButton id={id} action={deleteMenuAction} label="このメニュー" />
    </div>
  );
}
