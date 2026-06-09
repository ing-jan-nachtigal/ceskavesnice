"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SuccessToastProps = {
  message: string;
};

export function SuccessToast({ message }: SuccessToastProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsVisible(false);
      router.replace("/", {
        scroll: false,
      });
    }, 10_000);

    return () => window.clearTimeout(timeout);
  }, [router]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-20 z-[70] px-5 sm:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-700/18 bg-emerald-50 px-5 py-5 text-[#17331f] shadow-[0_18px_48px_rgba(32,84,52,0.16)] sm:px-7">
        <div className="flex gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-700 text-lg font-bold text-white">
            ✓
          </div>
          <p className="text-base font-semibold leading-8 sm:text-lg">{message}</p>
        </div>
      </div>
    </div>
  );
}
