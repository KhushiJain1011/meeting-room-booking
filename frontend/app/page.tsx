"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, RefreshCw } from "lucide-react";

import BookingForm from "@/components/BookingForm";
import RoomCard from "@/components/RoomCard";
import Toast from "@/components/Toast";
import {
  cancelBooking,
  createBooking,
  getBookings,
  getRooms,
  type Booking,
  type Room,
} from "@/lib/api";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(
    null
  );

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formRoomId, setFormRoomId] = useState<number | null>(null);

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [cancellingId, setCancellingId] = useState<number | null>(
    null
  );

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // runs immediately when the page loads:
  
  useEffect(() => {
    loadRooms();
  }, []);
  
  useEffect(() => {
    loadBookings();
  }, [selectedDate, selectedRoomId]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  async function loadRooms() {
    try {
      setLoadingRooms(true);

      const data = await getRooms();

      setRooms(data);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to load rooms.",
        "error"
      );
    } finally {
      setLoadingRooms(false);
    }
  }

  async function loadBookings() {
    try {
      setLoadingBookings(true);

      const data = await getBookings(
        selectedDate,
        selectedRoomId || undefined
      );

      setBookings(data);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to load bookings.",
        "error"
      );
    } finally {
      setLoadingBookings(false);
    }
  }

  function showToast(
    message: string,
    type: "success" | "error"
  ) {
    setToast({
      message,
      type,
    });
  }

  function openBookingForm(roomId: number | null = null) {
    setFormRoomId(roomId);
    setShowBookingForm(true);
  }

  async function handleCreateBooking(data: {
    room_id: number;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
  }) {
    try {
      await createBooking(data);

      setShowBookingForm(false);

      showToast(
        "Booking created successfully.",
        "success"
      );

      await loadBookings();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to create booking.",
        "error"
      );

      throw error;
    }
  }

  async function handleCancelBooking(bookingId: number) {
    try {
      setCancellingId(bookingId);

      const result = await cancelBooking(bookingId);

      showToast(result.message, "success");

      await loadBookings();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to cancel booking.",
        "error"
      );
    } finally {
      setCancellingId(null);
    }
  }

  const visibleRooms = useMemo(() => {
    if (!selectedRoomId) {
      return rooms;
    }

    return rooms.filter(
      (room) => room.id === selectedRoomId
    );
  }, [rooms, selectedRoomId]);

  function getRoomBookings(roomId: number) {
    return bookings.filter(
      (booking) => booking.room_id === roomId
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="mb-6">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Meeting Room Booking
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Find and book a meeting room
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
            View room availability, create bookings, and
            manage existing bookings.
          </p>
        </header>

        <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Select date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) =>
                      setSelectedDate(event.target.value)
                    }
                    className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Filter by room
                </label>

                <select
                  value={selectedRoomId || ""}
                  onChange={(event) =>
                    setSelectedRoomId(
                      event.target.value
                        ? Number(event.target.value)
                        : null
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                >
                  <option value="">All rooms</option>

                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={loadBookings}
              disabled={loadingBookings}
              className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />

              Refresh
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Rooms
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Working hours: 09:00 – 18:00
            </p>
          </div>

          <button
            onClick={() => openBookingForm()}
            disabled={rooms.length === 0}
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 sm:hidden"
          >
            New Booking
          </button>
        </div>

        {loadingRooms ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <p className="text-sm text-gray-500">
              Loading rooms...
            </p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
            <h3 className="font-medium text-gray-800">
              No rooms available
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              No meeting rooms were found.
            </p>
          </div>
        ) : loadingBookings ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <p className="text-sm text-gray-500">
              Loading bookings...
            </p>
          </div>
        ) : visibleRooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
            <p className="text-sm text-gray-500">
              No room matches the selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {visibleRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                bookings={getRoomBookings(room.id)}
                onBook={openBookingForm}
                onCancel={handleCancelBooking}
                cancellingId={cancellingId}
              />
            ))}
          </div>
        )}
      </div>

      {showBookingForm && (
        <BookingForm
          rooms={rooms}
          selectedRoomId={formRoomId}
          selectedDate={selectedDate}
          onClose={() => setShowBookingForm(false)}
          onSubmit={handleCreateBooking}
        />
      )}
    </main>
  );
}