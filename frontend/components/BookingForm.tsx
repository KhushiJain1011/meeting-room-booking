"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Room } from "@/lib/api";

interface BookingFormProps {
  rooms: Room[];
  selectedRoomId: number | null;
  selectedDate: string;
  onClose: () => void;
  onSubmit: (data: {
    room_id: number;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
  }) => Promise<void>;
}

export default function BookingForm({
  rooms,
  selectedRoomId,
  selectedDate,
  onClose,
  onSubmit,
}: BookingFormProps) {
  const [roomId, setRoomId] = useState(
    selectedRoomId?.toString() || ""
  );

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!roomId) {
      setError("Please select a room.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a booking title.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (!startTime || !endTime) {
      setError("Please select both start and end time.");
      return;
    }

    if (endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }

    if (startTime < "09:00" || endTime > "18:00") {
      setError("Booking time must be between 09:00 and 18:00.");
      return;
    }

    try {
      setSubmitting(true);

      await onSubmit({
        room_id: Number(roomId),
        title: title.trim(),
        date,
        start_time: startTime,
        end_time: endTime,
      });
    } catch {
      // The parent handles API errors and notifications.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create Booking
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Book a room between 09:00 and 18:00.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Room
            </label>

            <select
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            >
              <option value="">Select room</option>

              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Team Meeting"
              maxLength={200}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Start time
              </label>

              <input
                type="time"
                min="09:00"
                max="18:00"
                value={startTime}
                onChange={(event) =>
                  setStartTime(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                End time
              </label>

              <input
                type="time"
                min="09:00"
                max="18:00"
                value={endTime}
                onChange={(event) =>
                  setEndTime(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-500"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}