"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthService } from "../services/auth";

interface AuthFormProps {
  mode?: "login" | "signup";
}

export function AuthForm({ mode: initialMode = "login" }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        await AuthService.signup({ name, email, password });
      } else {
        await AuthService.login({ email, password });
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[rgba(255,255,255,0.9)] backdrop-blur-xl rounded-[28px] p-6 sm:p-10 w-full max-w-[420px] shadow-ambient border border-[#dbe3e7]">
      <div className="w-full flex items-center justify-center pb-6">
        <h2 className="text-2xl font-bold ">Welcome</h2>
      </div>

      <div className="relative flex bg-surface-container-low p-1 rounded-xl mb-6">
        <button
          className={`relative z-10 flex-1 p-2.5 border-none rounded-xl text-sm font-semibold cursor-pointer transition-colors duration-200 bg-transparent ${mode === "login" ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          onClick={() => setMode("login")}
          type="button"
        >
          Login
        </button>
        <button
          className={`relative z-10 flex-1 p-2.5 border-none rounded-xl text-sm font-semibold cursor-pointer transition-colors duration-200 bg-transparent ${mode === "signup" ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          onClick={() => setMode("signup")}
          type="button"
        >
          Sign Up
        </button>
        <div className="absolute inset-y-1 left-1 right-1 pointer-events-none z-0">
          <div
            className={`w-1/2 h-full bg-white rounded-xl shadow-sm transition-transform duration-300 ease-out ${mode === "login" ? "translate-x-0" : "translate-x-full"}`}
          />
        </div>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-error/10 border border-error/20 text-error text-[0.8rem] p-3 rounded-xl mb-2">
            {error}
          </div>
        )}

        {mode === "signup" && (
          <div className="flex flex-col">
            <label className="block text-[0.65rem] font-extrabold tracking-widest text-on-surface-variant mb-1.5 uppercase">Full Name</label>
            <input
              type="text"
              placeholder="Julianne Smith"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border-none bg-surface-container-low rounded-xl text-sm text-on-surface transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary placeholder:text-[#98a5ab]"
            />
          </div>
        )}

        <div className="flex flex-col">
          <label className="block text-[0.65rem] font-extrabold tracking-widest text-on-surface-variant mb-1.5 uppercase">Email Address</label>
          <input
            type="email"
            placeholder="julianne@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border-none bg-surface-container-low rounded-xl text-sm text-on-surface transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary placeholder:text-[#98a5ab]"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-[0.65rem] font-extrabold tracking-widest text-on-surface-variant mb-1.5 uppercase">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-none bg-surface-container-low rounded-xl text-sm text-on-surface transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary placeholder:text-[#98a5ab]"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-on-surface-variant cursor-pointer p-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          {mode === "signup" && <p className="m-0 mt-2 text-[0.7rem] text-on-surface-variant italic">Must be at least 8 characters.</p>}
        </div>

        <button type="submit" disabled={isLoading} className="w-full p-4 mt-2 bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-container))] text-white border-none rounded-xl text-sm font-bold cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 shadow-[0_10px_24px_rgba(45,152,218,0.22)]">
          {isLoading ? "Please wait..." : mode === "signup" ? "Get Started" : "Log in"}
        </button>
      </form>

      {/* <div className="flex items-center my-6">
        <hr className="flex-1 border-none h-px bg-surface-variant" />
        <span className="mx-4 text-[0.65rem] font-bold tracking-widest text-on-surface-variant uppercase">Or continue with</span>
        <hr className="flex-1 border-none h-px bg-surface-variant" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-container-low hover:bg-[#e4e1db] border-none text-[0.8rem] font-bold text-on-surface cursor-pointer transition-colors duration-200" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>
        <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-container-low hover:bg-[#e4e1db] border-none text-[0.8rem] font-bold text-on-surface cursor-pointer transition-colors duration-200" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.11.78.9-.04 2.1-.8 3.54-.69 1.48.12 2.6.73 3.38 1.83-3.15 1.9-2.66 5.9.15 7.15-.65 1.65-1.55 3.3-2.18 3.9zM12.03 7.25c-.02-2.13 1.75-3.95 3.65-4.1.25 2.3-1.85 4.35-3.65 4.1z" />
          </svg>
          Apple
        </button>
      </div> */}

      <p className="text-center text-[0.7rem] text-on-surface-variant my-4 px-4 leading-relaxed ">
        By signing up, you agree to our <Link href="/terms" className="font-bold text-primary no-underline hover:underline">Terms</Link> and <Link href="/privacy" className="font-bold text-primary no-underline hover:underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
