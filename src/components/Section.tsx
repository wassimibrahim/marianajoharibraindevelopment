import type { ReactNode } from "react";

export function Section({
  id,
  index,
  eyebrow,
  title,
  children,
  wide,
  plain,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  wide?: boolean;
  /** Open layout, no surrounding panel: used to break up the rhythm of cards. */
  plain?: boolean;
}) {
  return (
    <section id={id} className={`relative z-10 scroll-mt-4 overflow-x-clip px-4 sm:px-6 ${plain ? "py-16 sm:py-24" : "py-14 sm:py-20"}`}>
      <div className={`mx-auto ${wide ? "max-w-5xl" : "max-w-2xl"}`}>
        <div className="mb-8 text-center">
          <p className="eyebrow">
            <span className="text-rose">{index}</span> · {eyebrow}
          </p>
          <h2 className="display mt-3 text-[clamp(1.9rem,7vw,2.9rem)] leading-[1.05] text-ink">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
