"use client";

import { useState, useTransition } from "react";
import { login, signup } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Ruler, Weight, Eye, EyeOff, Dumbbell, User } from "lucide-react";
import Image from "next/image";
import { BEAST_LOGO_B64 } from "@/lib/logo";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
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
          setSuccessMsg(res.message || "Account created! You can now sign in.");
          setIsLogin(true);
          setEmail("");
          setPassword("");
        } else {
          setError(res.error || "Signup failed");
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden">

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm px-4 flex flex-col items-center gap-8">

        {/* Logo & Brand */}
        <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="relative">
            <Image
              src={BEAST_LOGO_B64}
              alt="Beast Tracker"
              width={72}
              height={72}
              className="relative rounded-3xl bg-black border border-muted"
              unoptimized={true}
            />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tighter uppercase text-accent">
              Beast <span className="text-primary">Tracker</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {isLogin ? "Welcome back, beast! 💪" : "Start your journey today"}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-card/70 backdrop-blur-xl border border-muted/60 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">

          {/* Tab switcher */}
          <div className="flex bg-muted/40 m-3 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(""); setSuccessMsg(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                isLogin
                  ? "bg-card text-foreground border border-muted"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(""); setSuccessMsg(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                !isLogin
                  ? "bg-card text-foreground border border-muted"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="px-6 pb-6 space-y-4">

            {/* Error / Success banners */}
            {error && (
              <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm border border-red-500/20 animate-in fade-in duration-300 flex items-start gap-2">
                <span className="mt-0.5 shrink-0">⚠️</span>
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-500/10 text-green-400 px-4 py-3 rounded-xl text-sm border border-green-500/20 animate-in fade-in duration-300 flex items-start gap-2">
                <span className="mt-0.5 shrink-0">✅</span>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-background/60 border border-muted rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-background/60 border border-muted rounded-xl pl-10 pr-11 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Name & Gender (sign up only) */}
              {!isLogin && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex-[2] space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-background/60 border border-muted rounded-xl pl-9 pr-3 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gender</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full bg-background/60 border border-muted rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Height & Weight (sign up only) */}
              {!isLogin && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Height (cm)</label>
                    <div className="relative">
                      <Ruler size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="175"
                        value={height}
                        onChange={e => setHeight(e.target.value)}
                        className="w-full bg-background/60 border border-muted rounded-xl pl-9 pr-3 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Weight (kg)</label>
                    <div className="relative">
                      <Dumbbell size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="75"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        className="w-full bg-background/60 border border-muted rounded-xl pl-9 pr-3 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full relative overflow-hidden bg-primary text-primary-foreground py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                {isPending ? (
                  <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-xs text-muted-foreground/60 text-center animate-in fade-in duration-1000 delay-500">
          Track every rep. Own every session.
        </p>
      </div>
    </div>
  );
}
