import Link from "next/link";
import { FiArrowLeft, FiCompass, FiFileText, FiShield } from "react-icons/fi";
import BrandLogo from "../components/brand-logo";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="glow-bg min-h-screen">
      <MaxWidthWrapper className="flex min-h-screen items-center py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[36px] border border-[#dbe3e7] bg-white/88 p-8 shadow-ambient backdrop-blur-xl sm:p-12">
            <BrandLogo />

            <div className="mt-10 flex flex-col gap-6">
              <span className="w-fit rounded-full bg-[#edf3f6] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">
                Error 404
              </span>

              <div className="space-y-4">
                <h1 className="font-manrope text-5xl font-extrabold tracking-[-0.05em] text-on-surface sm:text-6xl">
                  The page drifted out of orbit.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-on-surface-variant sm:text-lg">
                  The link may be outdated, the route may not exist, or the page may have been moved while the product evolved. You can safely jump back to the main flow from here.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-5">
                  <Link href="/">
                    <FiCompass className="mr-1" />
                    Go Home
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-[#dbe3e7] bg-white px-5">
                  <Link href="/login">
                    <FiArrowLeft className="mr-1" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-5 lg:justify-center">
            <div className="rounded-[30px] border border-[#dbe3e7] bg-white/82 p-6 shadow-[0_18px_42px_rgba(45,52,54,0.09)] backdrop-blur-xl">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">Helpful Routes</p>
              <div className="mt-5 space-y-3">
                <Link
                  href="/terms"
                  className="flex items-center justify-between rounded-2xl border border-[#e5ecef] bg-[#f9fbfc] px-4 py-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:bg-white"
                >
                  <span className="flex items-center gap-3">
                    <FiFileText className="text-primary" />
                    Terms of Service
                  </span>
                  <span className="text-on-surface-variant">Open</span>
                </Link>
                <Link
                  href="/privacy"
                  className="flex items-center justify-between rounded-2xl border border-[#e5ecef] bg-[#f9fbfc] px-4 py-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:bg-white"
                >
                  <span className="flex items-center gap-3">
                    <FiShield className="text-primary" />
                    Privacy Policy
                  </span>
                  <span className="text-on-surface-variant">Open</span>
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] bg-[#2d3436] p-6 text-white shadow-[0_18px_42px_rgba(45,52,54,0.16)]">
              <p className="font-manrope text-2xl font-extrabold tracking-[-0.03em]">
                Small detour. Clean recovery.
              </p>
              <p className="mt-3 text-sm leading-7 text-white/75">
                Taskly keeps the recovery path simple: one clear message, useful links, and a fast route back into the product.
              </p>
            </div>
          </aside>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
