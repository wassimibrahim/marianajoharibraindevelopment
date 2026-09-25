"use client";

import { Download, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { Flower, PALETTES } from "./Flower";

const FILE = "mariana-24-birthday-postcard.png";

/**
 * A shareable postcard. Deliberately contains only her first name, "24" and
 * the two lines below: no birth date, jobs, passports, jokes or test history.
 */
export function BirthdayPostcard() {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string>();

  const render = async () => {
    const { toBlob } = await import("html-to-image");
    return toBlob(ref.current!, { pixelRatio: 3, backgroundColor: "#fbf7f0", cacheBust: true });
  };

  const download = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = FILE;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const run = async (share: boolean) => {
    setBusy(true);
    setNote(undefined);
    try {
      const blob = await render();
      if (!blob) throw new Error("render failed");
      if (share) {
        const file = new File([blob], FILE, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: "Happy 24th, Mariana" });
            return;
          } catch (e) {
            if (e instanceof DOMException && e.name === "AbortError") return;
          }
        }
        download(blob);
        setNote("Sharing isn't available here, so the postcard was downloaded instead.");
        return;
      }
      download(blob);
    } catch {
      setNote("The postcard was camera-shy. A screenshot works too.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={ref} className="relative aspect-[4/5] w-[min(84vw,360px)] overflow-hidden rounded-[22px] bg-[#fbf7f0] shadow-lift">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(22rem 18rem at 100% 0%, #efe9fc, transparent 65%), radial-gradient(22rem 18rem at 0% 100%, #fdebf1, transparent 65%), radial-gradient(16rem 12rem at 100% 100%, #fff1cc, transparent 65%)",
          }}
        />
        <div className="absolute inset-3 rounded-[16px] border border-gold/50" />
        <Flower kind="rose" size="30%" palette={PALETTES.rose[0]} className="absolute -top-[6%] -left-[6%] rotate-[-14deg]" />
        <Flower kind="blossom" size="16%" palette={PALETTES.blossom[2]} className="absolute top-[18%] left-[3%]" />
        <Flower kind="tulip" size="24%" palette={PALETTES.tulip[3]} className="absolute -top-[2%] -right-[3%] rotate-[18deg]" />
        <Flower kind="daisy" size="26%" palette={PALETTES.daisy[2]} className="absolute -right-[6%] -bottom-[5%]" />
        <Flower kind="blossom" size="22%" palette={PALETTES.blossom[0]} className="absolute -bottom-[4%] -left-[4%]" />
        <Flower kind="lavender" size="20%" palette={PALETTES.lavender[1]} className="absolute right-[4%] bottom-[20%] rotate-[-10deg]" />

        <div className="relative flex h-full flex-col items-center justify-center px-[14%] text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-gold">HAPPY BIRTHDAY</p>
          <p className="display mt-2 text-[clamp(2.2rem,11vw,3.1rem)] leading-none text-ink italic">Mariana</p>
          <p className="display iridescent mt-1 text-[clamp(5.5rem,30vw,8.5rem)] leading-[0.9] font-semibold">24</p>
          <div className="mt-4 space-y-1 text-[clamp(0.85rem,3.6vw,0.98rem)] leading-snug text-ink/80">
            <p>Frontal lobe: under investigation.</p>
            <p className="font-medium text-ink">Birthday girl: beyond question.</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={() => run(true)} disabled={busy}>
          <Share2 size={16} /> Share postcard
        </button>
        <button type="button" className="btn-soft" onClick={() => run(false)} disabled={busy}>
          <Download size={16} /> Download
        </button>
      </div>
      {note && (
        <p className="mt-2 text-center text-[13px] text-ink-soft" role="status">
          {note}
        </p>
      )}
    </div>
  );
}
