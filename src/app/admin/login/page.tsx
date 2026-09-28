import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        action={loginAction}
        className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4 shadow-sm"
      >
        <h1 className="text-lg font-bold text-center">サロン管理画面</h1>
        {error && (
          <p className="text-red-700 text-sm text-center" role="alert">
            パスワードが違います。もう一度お試しください。
          </p>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold">パスワード</span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            className="min-h-12 rounded-lg border border-gray-300 px-3 text-base"
          />
        </label>
        <button
          type="submit"
          className="min-h-12 rounded-lg bg-blue-600 text-white font-bold text-base active:bg-blue-700"
        >
          ログイン
        </button>
      </form>
    </div>
  );
}
