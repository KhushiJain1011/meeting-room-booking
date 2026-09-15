"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, X, XCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  onClose,
}: ToastProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: -20, x: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-md items-start gap-3 rounded-lg border bg-white p-4 shadow-lg"
      >
        {type === "success" ? (
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        )}

        <p className="flex-1 text-sm text-gray-700">
          {message}
        </p>

        <button
          onClick={onClose}
          className="text-gray-400 transition hover:text-gray-700"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}