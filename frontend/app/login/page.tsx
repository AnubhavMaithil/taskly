import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import { AuthForm } from "../../components/auth-form";
import BrandLogo from "../../components/brand-logo";


export default function LoginPage() {
  return (
    <div className="glow-bg min-h-screen">
      <MaxWidthWrapper className="flex flex-col lg:flex-row min-h-screen py-16 sm:py-20 lg:py-10 gap-10 lg:gap-16 items-center w-full mx-auto relative auth-shell">
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none" />

        <section className="flex flex-col gap-6 w-full">
          <BrandLogo />

          <h1 className="hidden md:block text-4xl md:text-5xl lg:text-[3.5rem] leading-tight lg:leading-none tracking-[-0.04em] font-manrope font-extrabold text-on-surface">
            Stay organized,<br />stay calm.
          </h1>
          <p className="hidden md:block text-base md:text-lg text-on-surface-variant max-w-[480px] leading-relaxed">
            Experience productivity as a sanctuary. Taskly helps you manage your workflow with intentionality and focus.
          </p>

          <div className="w-full aspect-16/10 rounded-[20px] overflow-hidden shadow-2xl mt-2 hidden md:block">
            <img
              src="/desk_sanctuary_image_1775470771516.png"
              alt="Serene Workspace"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        <div className="flex justify-center w-full">
          <AuthForm mode="login" />
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
