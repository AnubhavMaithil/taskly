import Link from "next/link";
import { ReactNode } from "react";
import { FiArrowLeft, FiClock, FiFileText } from "react-icons/fi";
import BrandLogo from "./brand-logo";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button } from "./ui/button";

type LegalSection = {
  heading: string;
  paragraphs: readonly string[];
};

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  sections: readonly LegalSection[];
  highlights: readonly string[];
  children?: ReactNode;
};

export function LegalPageShell({
  eyebrow,
  title,
  intro,
  updatedAt,
  sections,
  highlights,
  children
}: LegalPageShellProps) {
  return (
    <div className="glow-bg min-h-screen">
      <MaxWidthWrapper className="py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo compact className="!gap-3" />
            <Button asChild variant="outline" className="rounded-full border-[#dbe3e7] bg-white/80 px-4">
              <Link href="/login" prefetch={false}>
                <FiArrowLeft className="mr-1" />
                Back
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <main className="rounded-[32px] border border-[#dbe3e7] bg-white/88 p-6 shadow-ambient backdrop-blur-xl sm:p-10">
              <div className="mb-8 flex flex-col gap-4 border-b border-[#e5ecef] pb-8">
                <span className="w-fit rounded-full bg-[#edf3f6] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">
                  {eyebrow}
                </span>
                <div className="flex flex-col gap-3">
                  <h1 className="font-manrope text-4xl font-extrabold tracking-[-0.04em] text-on-surface sm:text-5xl">
                    {title}
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-on-surface-variant sm:text-lg">
                    {intro}
                  </p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dbe3e7] bg-[#f9fbfc] px-4 py-2 text-sm font-semibold text-on-surface-variant">
                  <FiClock className="text-primary" />
                  Last updated {updatedAt}
                </div>
              </div>

              <div className="space-y-8">
                {sections.map((section) => (
                  <section key={section.heading} className="space-y-3">
                    <h2 className="font-manrope text-2xl font-bold tracking-[-0.03em] text-on-surface">
                      {section.heading}
                    </h2>
                    <div className="space-y-3 text-sm leading-7 text-on-surface-variant sm:text-base">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {children ? <div className="mt-10 border-t border-[#e5ecef] pt-8">{children}</div> : null}
            </main>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-8 lg:self-start">
              <div className="rounded-[28px] border border-[#dbe3e7] bg-white/88 p-6 shadow-[0_18px_42px_rgba(45,52,54,0.09)] backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-container))] text-white shadow-lg">
                    <FiFileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-manrope text-lg font-bold text-on-surface">Quick Notes</p>
                    <p className="text-sm text-on-surface-variant">The essentials at a glance.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-2xl border border-[#e5ecef] bg-[#f9fbfc] px-4 py-3 text-sm font-medium leading-6 text-on-surface-variant"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#dbe3e7] bg-[#2d3436] p-6 text-white shadow-[0_18px_42px_rgba(45,52,54,0.16)]">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/65">
                  Need Help?
                </p>
                <h3 className="mt-3 font-manrope text-2xl font-extrabold tracking-[-0.03em]">
                  Reach out before anything feels unclear.
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  These pages are designed to be readable. If you need clarification, contact the team before you continue using the app.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full px-5">
                    <Link href="/login" prefetch={false}>Open Taskly</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-white/20 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white">
                    <Link href="/" prefetch={false}>Go Home</Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
