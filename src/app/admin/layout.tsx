import Link from "next/link";
import { logoutAction } from "./login/actions";

const NAV_ITEMS = [
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/menus", label: "メニュー" },
  { href: "/admin/conversations", label: "会話ログ" },
  { href: "/admin/broadcast", label: "お知らせ" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold">サロン管理画面</h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="min-h-11 px-3 text-sm text-gray-500 underline"
          >
            ログアウト
          </button>
        </form>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 max-w-lg mx-auto w-full">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 min-h-14 text-xs font-medium text-gray-700 active:bg-gray-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
