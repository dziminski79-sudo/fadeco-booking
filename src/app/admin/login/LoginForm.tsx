"use client";

import { useActionState } from "react";
import { sendMagicLink } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLink, null);
  return (
    <form action={action} className="mt-6 space-y-3">
      <input
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
      />
      <button
        disabled={pending}
        className="w-full rounded-md bg-amber-500 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
      >
        {pending ? "Sending" : "Send sign-in link"}
      </button>
      {state && <p className="text-sm text-neutral-300">{state.message}</p>}
    </form>
  );
}
