"use client";

import { useState } from "react";
import { useActionState } from "react";
import { signIn, signUp } from "./actions";

const initialState = { error: "", message: "" };

export default function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction] = useActionState(signIn, initialState);
  const [signUpState, signUpAction] = useActionState(signUp, initialState);

  const state = mode === "signin" ? signInState : signUpState;
  const action = mode === "signin" ? signInAction : signUpAction;

  return (
    <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-[0_24px_64px_rgba(27,58,75,0.12)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <div className="flex rounded-full bg-[color:var(--surface-2)] p-1 text-xs font-semibold">
          {["signin", "signup"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value as "signin" | "signup")}
              className={`rounded-full px-3 py-1 ${
                mode === value
                  ? "bg-[color:var(--accent)] text-white"
                  : "text-[var(--muted)]"
              }`}
            >
              {value === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-sm text-[var(--muted)]">
        Access your personal study command center.
      </p>

      <form action={action} className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
            placeholder="you@example.com"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Password
          <input
            name="password"
            type="password"
            required
            className="rounded-2xl border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
            placeholder="••••••••"
          />
        </label>

        {state?.error ? (
          <div className="rounded-2xl bg-[color:var(--surface-2)] px-4 py-2 text-sm text-[var(--muted)]">
            {state.error}
          </div>
        ) : null}

        {state?.message ? (
          <div className="rounded-2xl bg-[color:var(--surface-2)] px-4 py-2 text-sm text-[var(--muted)]">
            {state.message}
          </div>
        ) : null}

        <button
          type="submit"
          className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
