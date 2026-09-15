"use client";

import { Plus } from "lucide-react";
import type { Booking, Room } from "@/lib/api";
import BookingList from "./BookingList";

interface RoomCardProps {
  room: Room;
  bookings: Booking[];
  onBook: (roomId: number) => void;
  onCancel: (bookingId: number) => void;
  cancellingId: number | null;
}

export default function RoomCard({
  room,
  bookings,
  onBook,
  onCancel,
  cancellingId,
}: RoomCardProps) {
  return (
    <section className="rounded-2xl border bg-gray-50/50 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {room.name}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {bookings.length}{" "}
            {bookings.length === 1 ? "booking" : "bookings"}
          </p>
        </div>

        <button
          onClick={() => onBook(room.id)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Book Room
        </button>
      </div>

      <BookingList
        bookings={bookings}
        onCancel={onCancel}
        cancellingId={cancellingId}
      />
    </section>
  );
}