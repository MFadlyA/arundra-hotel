"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, AlertCircle, X } from "lucide-react";

export default function GlobalAlertModal() {
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    title: "Arundra Signature Notice",
    message: "",
    type: "info",
  });

  const closeModal = () => {
    setModal({
      open: false,
      title: "Arundra Signature Notice",
      message: "",
      type: "info",
    });
  };

  useEffect(() => {
    // Intercept native browser alert across all pages to eliminate "localhost:3000 says"
    const originalAlert = window.alert;

    window.alert = (msg?: unknown) => {
      setModal({
        open: true,
        title: "Arundra Signature Notice",
        message: String(msg ?? ""),
        type: "info",
      });
    };

    const handleCustomAlert = (e: Event) => {
      const customEvent = e as CustomEvent<{
        message: string;
        title?: string;
        type?: "success" | "error" | "warning" | "info";
      }>;
      if (customEvent.detail?.message) {
        setModal({
          open: true,
          title: customEvent.detail.title || "Arundra Signature Notice",
          message: customEvent.detail.message,
          type: customEvent.detail.type,
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("arundra-alert", handleCustomAlert);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.alert = originalAlert;
      window.removeEventListener("arundra-alert", handleCustomAlert);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!modal.open) return null;

  const isSuccess =
    modal.type === "success" ||
    /saved|success|complete|restored/i.test(modal.title) ||
    /saved successfully|published successfully|restored to factory/i.test(
      modal.message
    );

  const isError =
    modal.type === "error" ||
    /error|failed/i.test(modal.title) ||
    /failed to|save error|reset error|upload failed/i.test(modal.message);

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#ded5c8] pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : isError
                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                  : "bg-[#f4ede4] text-[#755b43]"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 size={18} />
              ) : isError ? (
                <AlertCircle size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}
            </div>
            <h3 className="text-base font-serif font-bold text-[#4a382d]">
              {modal.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="cursor-pointer rounded-lg p-1.5 text-[#777064] hover:bg-[#f8f6f1] transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 text-xs leading-relaxed text-[#62594f]">
          {modal.message}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={closeModal}
            className="cursor-pointer rounded-lg bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#655043] transition shadow-xs"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
