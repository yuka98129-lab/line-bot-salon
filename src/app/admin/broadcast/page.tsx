import BroadcastForm from "./BroadcastForm";

export default function BroadcastPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-bold">お知らせ一斉配信</h2>
      <p className="text-sm text-gray-500">
        入力した内容が、LINE公式アカウントの友だち全員に一斉送信されます。送信前に内容をよくご確認ください。
      </p>
      <BroadcastForm />
    </div>
  );
}
