"use client";

import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { exportState, importState } from "@/lib/storage";
import { useLab } from "./LabProvider";

/** History lives in this browser; this lets it move to a new phone. */
export function LabRecords() {
  const { state, update } = useLab();
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>();

  const doExport = () => {
    const blob = new Blob([exportState(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mariana-lab-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("History file downloaded. Keep it somewhere safe, like a very small vault.");
  };

  const doImport = async (file: File) => {
    try {
      const text = await file.text();
      let added = 0;
      update((draft) => {
        const merged = importState(draft, text);
        added = merged.added;
        Object.assign(draft, merged.state);
      });
      setMessage(added ? `Imported ${added} experiment${added === 1 ? "" : "s"}. Nothing was overwritten.` : "Nothing new in that file — your history already had it all.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "That file couldn't be read.");
    }
  };

  return (
    <div className="rounded-3xl border border-dashed border-ink/15 px-5 py-5 text-center sm:px-8">
      <p className="text-[14px] leading-relaxed text-ink-soft">
        Your history is saved <strong className="font-medium text-ink">in this browser, on this device</strong>. Nothing is sent anywhere. Changing
        phone? Export it here and import it on the new one.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-soft" onClick={doExport}>
          <Download size={16} /> Export history
        </button>
        <button type="button" className="btn-soft" onClick={() => input.current?.click()}>
          <Upload size={16} /> Import history
        </button>
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) doImport(f);
            e.target.value = "";
          }}
        />
      </div>
      {message && (
        <p className="mt-3 text-[13px] text-iris" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
