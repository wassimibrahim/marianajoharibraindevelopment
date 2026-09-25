"use client";

import { motion } from "framer-motion";
import { Download, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { formatLongDate } from "@/lib/dates";
import { Flower } from "./Flower";

export function Certificate({ score, date }: { score: number; date: Date }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string>();

  const render = async () => {
    if (!ref.current) return null;
    const { toPng } = await import("html-to-image");
    return toPng(ref.current, { pixelRatio: 2, backgroundColor: "#fbf7f0", cacheBust: true });
  };

  const save = async (share: boolean) => {
    setBusy(true);
    setNote(undefined);
    try {
      const url = await render();
      if (!url) return;
      if (share) {
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], "mariana-certificate-of-alleged-adulthood.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Certificate of Alleged Adulthood" });
          return;
        }
      }
      const a = document.createElement("a");
      a.href = url;
      a.download = "mariana-certificate-of-alleged-adulthood.png";
      a.click();
    } catch {
      setNote("The certificate resisted being photographed. Try a screenshot — for science.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.8, duration: 0.8 }}>
      <div ref={ref} className="relative overflow-hidden rounded-[20px] bg-ivory p-3 shadow-lift">
        <div className="relative rounded-[14px] border-[3px] border-double border-gold/70 px-6 pt-14 pb-12 text-center sm:px-12 sm:py-16">
          <Flower kind="rose" size={70} className="absolute -top-4 -left-4 rotate-[-20deg]" />
          <Flower kind="hibiscus" size={64} className="absolute -top-3 -right-3 rotate-12" />
          <Flower kind="daisy" size={60} className="absolute -bottom-4 -left-2" />
          <Flower kind="lavender" size={72} className="absolute -right-2 -bottom-3 -rotate-12" />

          <p className="font-mono text-[10px] tracking-[0.3em] text-gold">JOHARI COGNITIVE RESEARCH INSTITUTE</p>
          <p className="display mt-6 text-[clamp(2rem,9vw,3.2rem)] leading-none font-semibold tracking-tight text-ink">MARIANA JOHARI</p>
          <p className="display mt-3 text-[clamp(0.95rem,3.8vw,1.2rem)] tracking-[0.2em] text-ink-soft">CERTIFICATE OF</p>
          <p className="display gold-text mt-1 text-[clamp(1.9rem,8vw,3rem)] leading-tight font-semibold italic">Alleged Adulthood</p>

          <p className="mx-auto mt-6 max-w-md text-[14px] leading-relaxed text-ink/80">
            This certifies that the specimen, having reached the chronological age of twenty-five and completed the Final Frontal-Lobe
            Examination with a game score of <strong className="text-ink">{score}/100</strong>, is hereby
            declared <strong className="text-ink">allegedly an adult</strong>, pending further behavioural evidence. The laboratory notes
            that a game score cannot certify anything, and has chosen to celebrate anyway.
          </p>

          <div className="mx-auto mt-8 flex max-w-md items-end justify-between gap-6">
            <div className="flex-1 text-left">
              <p className="display text-xl text-ink italic">Wassim</p>
              <p className="border-t border-ink/30 pt-1 font-mono text-[9px] tracking-widest text-ink-soft">PRINCIPAL INVESTIGATOR</p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-champagne to-gold text-2xl shadow-inner">🧠</div>
            <div className="flex-1 text-right">
              <p className="display text-base leading-tight text-ink italic sm:text-xl">{formatLongDate(date)}</p>
              <p className="border-t border-ink/30 pt-1 font-mono text-[9px] tracking-widest text-ink-soft">DATE OF CERTIFICATION</p>
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-[16rem] font-mono text-[9px] text-ink-faint">Sample size: 1 · Love for subject: very high ❤️</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={() => save(true)} disabled={busy}>
          <Share2 size={16} /> Share certificate
        </button>
        <button type="button" className="btn-soft" onClick={() => save(false)} disabled={busy}>
          <Download size={16} /> Save as image
        </button>
      </div>
      {note && <p className="mt-2 text-center text-sm text-rose">{note}</p>}
    </motion.div>
  );
}
