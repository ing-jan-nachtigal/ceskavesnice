"use client";

import {
  requestManagementLinkAction,
  type ActionState,
} from "@/app/pridat-prispevek/actions";
import { useActionState } from "react";

const initialState: ActionState = {
  message: "",
  ok: false,
};

export function ManagementLinkForm() {
  const [state, action, isPending] = useActionState(requestManagementLinkAction, initialState);

  return (
    <form action={action} className="mt-8 grid gap-5">
      <label className="grid gap-2 text-sm font-medium text-[#334235]">
        E-mail
        <input
          name="email"
          type="email"
          required
          placeholder="vas@email.cz"
          className="border border-emerald-950/14 bg-[#f8faf4] px-4 py-3 outline-none transition placeholder:text-[#8a9385] focus:border-emerald-800/45 focus:bg-white"
        />
      </label>

      {state.message ? (
        <p
          className={`border px-4 py-3 text-sm leading-7 ${
            state.ok
              ? "border-emerald-900/18 bg-emerald-900/5 text-[#17331f]"
              : "border-red-900/18 bg-red-900/5 text-red-900"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="btn-3d btn-primary w-fit px-6 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Odesílám..." : "Poslat odkaz pro úpravu"}
      </button>
    </form>
  );
}
