"use client";

import { useTransition } from "react";
import Spinner from "./Spinner";

export default function DeleteButton({
  id,
  action,
  label,
}: {
  id: string;
  action: (id: string) => Promise<void>;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(`${label}を削除します。この操作は取り消せません。よろしいですか?`);
    if (!confirmed) return;

    startTransition(() => {
      action(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="min-h-11 px-4 flex items-center justify-center gap-2 rounded-lg border border-red-300 text-red-700 text-sm font-medium disabled:opacity-50"
    >
      {isPending && <Spinner />}
      {isPending ? "削除中..." : "削除"}
    </button>
  );
}
