import type { ReactNode } from "react";
export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="card p-10 text-center">
    <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gray-100">✦</div>
    <h3 className="font-bold">{title}</h3>
    <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{text}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>;
}
