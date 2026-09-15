const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface Room {
  id: number;
  name: string;
}

export interface Booking {
  id: number;
  room_id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface CreateBookingData {
  room_id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.detail || data?.message || "Something went wrong."
    );
  }

  return response.json();
}

export async function getRooms(): Promise<Room[]> {
  const response = await fetch(`${API_URL}/api/rooms`);

  return handleResponse(response);
}

export async function getBookings(
  date: string,
  roomId?: number
): Promise<Booking[]> {
  const params = new URLSearchParams();

  params.append("date", date);

  if (roomId) {
    params.append("room_id", roomId.toString());
  }

  const response = await fetch(
    `${API_URL}/api/bookings?${params.toString()}`
  );

  return handleResponse(response);
}

export async function createBooking(
  booking: CreateBookingData
): Promise<Booking> {
  const response = await fetch(`${API_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(booking),
  });

  return handleResponse(response);
}

export async function cancelBooking(
  bookingId: number
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_URL}/api/bookings/${bookingId}`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(response);
}