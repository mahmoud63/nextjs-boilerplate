"use client";

import { useState, useTransition } from "react";
import { login, signup } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { BEAST_LOGO_B64 } from "@/lib/logo";
import { Button, Field, SelectField, Tabs, type TabItem } from "@/components/ui";

type Mode = "signin" | "signup";

const MODES: ReadonlyArray<TabItem<Mode>> = [
  { value: "signin", label: "Sign in" },
  { value: "signup", label: "Sign up" },
];

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [showPassword, setShowPassword] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isLogin = mode === "signin";

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    startTransition(async () => {
      if (isLogin) {
        const res = await login(email, password);
        if (res.success) {
          router.push("/");
        } else {
          setError(res.error || "Login failed");
        }
      } else {
        const h = parseFloat(height);
        const w = parseFloat(weight);
        if (isNaN(h) || isNaN(w)) {
          setError("Height and weight must be numbers");
          return;
        }
        const res = await signup(email, password, name, gender, h, w);
        if (res.success) {
          setSuccessMsg(res.message || "Account created. You can now sign in.");
          setMode("signin");
          setEmail("");
          setPassword("");
        } else {
          setError(res.error || "Signup failed");
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-y-auto py-8">
      {/* Single lime hairline across the top instead of the old blurred glow blobs —
          a soft radial haze has no place in a system built on hard edges. */}
      <span className="pointer-events-none absolute top-0 inset-x-0 h-0.5 bg-accent-fill" />

      <div className="relative w-full max-w-sm px-5 flex flex-col animate-rise">
        <div className="flex items-center gap-3">
          <Image
            src={BEAST_LOGO_B64}
            alt="Beast Tracker"
            width={48}
            height={48}
            className="bg-black shrink-0"
            unoptimized={true}
          />
          <div className="min-w-0">
            <h1 className="font-display text-title-lg uppercase text-fg leading-none">
              Beast Tracker
            </h1>
            <p className="mt-1.5 text-eyebrow uppercase text-fg-dim">
              Track every rep. Own every session.
            </p>
          </div>
        </div>

        <Tabs items={MODES} value={mode} onChange={switchMode} className="mt-7" />

        <div className="border-x border-b border-line bg-panel p-5">
          {error && (
            <p className="mb-4 border-l-[3px] border-l-danger bg-danger-fill/20 px-3 py-2 text-body-sm text-danger">
              {error}
            </p>
          )}
          {successMsg && (
            <p className="mb-4 border-l-[3px] border-l-accent-fill px-3 py-2 text-body-sm text-accent">
              {successMsg}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <div className="relative">
              <Field
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 bottom-2 p-1.5 text-fg-dim hover:text-fg transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {!isLogin && (
              <>
                <div className="flex gap-3">
                  <Field
                    label="Name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    wrapperClassName="flex-[2]"
                  />
                  <SelectField
                    label="Gender"
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    wrapperClassName="flex-1"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </SelectField>
                </div>

                <div className="flex gap-3">
                  <Field
                    label="Height"
                    suffix="cm"
                    numeric
                    inputMode="decimal"
                    type="number"
                    step="0.1"
                    required
                    placeholder="175"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    wrapperClassName="flex-1"
                  />
                  <Field
                    label="Weight"
                    suffix="kg"
                    numeric
                    inputMode="decimal"
                    type="number"
                    step="0.1"
                    required
                    placeholder="75"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    wrapperClassName="flex-1"
                  />
                </div>
              </>
            )}

            <Button type="submit" fullWidth size="lg" loading={isPending} className="mt-2">
              {isLogin ? "Sign in" : "Create account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
