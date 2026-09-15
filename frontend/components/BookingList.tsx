"use client";

import { motion } from "framer-motion";
import { CalendarClock, Trash2 } from "lucide-react";
import type { Booking } from "@/lib/api";

interface BookingListProps {
  bookings: Booking[];
  onCancel: (bookingId: number) => void;
  cancellingId: number | null;
}

export default function BookingList({
  bookings,
  onCancel,
  cancellingId,
}: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-8 text-center">
        <CalendarClock className="mx-auto mb-3 h-8 w-8 text-gray-400" />

        <h3 className="font-medium text-gray-800">
          No bookings
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          This room is available for the selected date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3 className="font-medium text-gray-900">
              {booking.title}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {booking.start_time.slice(0, 5)} –{" "}
              {booking.end_time.slice(0, 5)}
            </p>
          </div>

          <button
            onClick={() => onCancel(booking.id)}
            disabled={cancellingId === booking.id}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />

            {cancellingId === booking.id
              ? "Cancelling..."
              : "Cancel"}
          </button>
        </motion.div>
      ))}
    </div>
  );
}