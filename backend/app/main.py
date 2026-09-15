from datetime import date

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud
from .booking_logic import (
    check_booking_conflict,
    find_next_available_slot,
    validate_booking_time,
)
from .database import Base, engine, get_db
from .schemas import (
    BookingCreate,
    BookingResponse,
    RoomResponse,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Meeting Room Booking API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "meeting-room-booking-five-inky.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# root endpoint: 
@app.get("/")
def root():
    return {"message": "Meeting Room Booking API is running"}


# get all rooms:
@app.get("/api/rooms", response_model=list[RoomResponse])
def get_rooms(db: Session = Depends(get_db)):
    return crud.get_rooms(db)

# get all bookings for a particular date for room id
@app.get("/api/bookings", response_model=list[BookingResponse])
def get_bookings(
    date: date,
    room_id: int | None = None,
    db: Session = Depends(get_db)
):
    return crud.get_bookings(
        db,
        booking_date=date,
        room_id=room_id
    )


@app.post(
    "/api/bookings",
    response_model=BookingResponse,
    status_code=201
)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db)
):
    room = crud.get_room(db, booking.room_id)

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found."
        )

    validate_booking_time(
        booking.start_time,
        booking.end_time
    )

    check_booking_conflict(
        db,
        booking.room_id,
        booking.date,
        booking.start_time,
        booking.end_time
    )

    return crud.create_booking(
        db,
        booking.model_dump()
    )


@app.delete("/api/bookings/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    booking = crud.get_booking(db, booking_id)

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found."
        )

    crud.delete_booking(db, booking)

    return {
        "message": "Booking cancelled successfully."
    }


@app.get("/api/rooms/{room_id}/next-available")
def next_available(
    room_id: int,
    date: date,
    duration: int,
    db: Session = Depends(get_db)
):
    room = crud.get_room(db, room_id)

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found."
        )

    if duration <= 0:
        raise HTTPException(
            status_code=400,
            detail="Duration must be greater than 0 minutes."
        )

    bookings = crud.get_bookings(
        db,
        booking_date=date,
        room_id=room_id
    )

    slot = find_next_available_slot(
        bookings,
        date,
        duration
    )

    if slot is None:
        return {
            "message": "No available slot for the requested duration."
        }

    start_time, end_time = slot

    return {
        "room_id": room_id,
        "date": date,
        "duration_minutes": duration,
        "start_time": slot["start_time"],
        "end_time": slot["end_time"]
    }


# def find_next_available_slot_for_date(
#     bookings,
#     booking_date,
#     duration_minutes
# ):
#     from datetime import datetime, timedelta

#     required_duration = timedelta(minutes=duration_minutes)

#     current_time = datetime.combine(
#         booking_date,
#         time(9, 0)
#     )

#     working_end = datetime.combine(
#         booking_date,
#         time(18, 0)
#     )

#     for booking in bookings:
#         booking_start = datetime.combine(
#             booking_date,
#             booking.start_time
#         )

#         booking_end = datetime.combine(
#             booking_date,
#             booking.end_time
#         )

#         if booking_start - current_time >= required_duration:
#             return (
#                 current_time.time(),
#                 (current_time + required_duration).time()
#             )

#         if booking_end > current_time:
#             current_time = booking_end

#     if working_end - current_time >= required_duration:
#         return (
#             current_time.time(),
#             (current_time + required_duration).time()
#         )

#     return None