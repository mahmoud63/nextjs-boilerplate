"use client";

import { useState, useTransition } from "react";
import { login, signup } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    startTransition(async () => {
      if (isLogin) {
        const res = await login(username, password);
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
        const res = await signup(username, password, h, w);
        if (res.success) {
          router.push("/");
        } else {
          setError(res.error || "Signup failed");
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center gap-4">
        <Image src="/beast-logo.jpg" alt="Beast Tracker Icon" width={64} height={64} className="rounded-2xl bg-black shadow-lg" unoptimized={true} />
        <h1 className="text-3xl font-black tracking-tighter uppercase text-primary">Beast Tracker</h1>
      </div>
      <div className="w-full max-w-sm bg-card border border-muted p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-center mb-6 text-foreground">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-4 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Username</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full bg-background border border-muted rounded-lg p-3 text-sm" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-background border border-muted rounded-lg p-3 text-sm" 
            />
          </div>

          {!isLogin && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-muted-foreground block mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  step="0.1"
                  required 
                  value={height} 
                  onChange={e => setHeight(e.target.value)} 
                  className="w-full bg-background border border-muted rounded-lg p-3 text-sm" 
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-muted-foreground block mb-1">Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  required 
                  value={weight} 
                  onChange={e => setWeight(e.target.value)} 
                  className="w-full bg-background border border-muted rounded-lg p-3 text-sm" 
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center disabled:opacity-50 mt-2"
          >
            {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
