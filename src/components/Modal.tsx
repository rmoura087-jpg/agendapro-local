import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
    <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <h2 className="font-bold">{title}</h2>
        <button onClick={onClose} className="rounded-lg p-2 hover:bg-ink-100"><X size={18}/></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>;
}
