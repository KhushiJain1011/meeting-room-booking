from datetime import time, datetime, timedelta, timezone, date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from .models import Booking


# define start and end timing:
WORK_START = time(9, 0)
WORK_END = time(18, 0)


def validate_booking_time(start_time: time, end_time: time):
    # if end time is before start time or equal to sstart time:
    if end_time <= start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time."
        )

    # print("START: ", start_time)
    # print("END: ",end_time)

    # if start time is before *THE DEFINED WORK START TIME* or end time is after *THE DEFINED END TIME*
    if start_time < WORK_START or end_time > WORK_END:
        raise HTTPException(
            status_code=400,
            detail="Booking must be between 09:00 and 18:00."
        )


def check_booking_conflict(
    db: Session,
    room_id: int,
    booking_date: date,
    start_time: time,
    end_time: time
):
    # filter out all bookings that exists for provided room id on the given date:
    existing_bookings = (
        db.query(Booking)
        .filter(
            Booking.room_id == room_id,
            Booking.date == booking_date
        )
        .order_by(Booking.start_time)
        .all()
    )

    # EXAMPLE: 
    # existing booking: 10:00 - 12:00
    # new booking: 11:00 - 12:00
    for booking in existing_bookings:
        # Two bookings conflict only when their time ranges actually overlap.
        # Using < and > here deliberately allows back-to-back bookings. --> a booking for 10-11 and 11-12 can be made!!
        overlaps = (
            start_time < booking.end_time
            and end_time > booking.start_time
        )

        if overlaps:
            raise HTTPException(
                status_code=409,            # status code 409 -- conflicting condition
                detail=(
                    f"Room is already booked from "
                    f"{booking.start_time.strftime('%H:%M')} to "
                    f"{booking.end_time.strftime('%H:%M')} "
                    f"for '{booking.title}'."
                )
            )


# # given is existing list of bookings, find the earliest time slot where a new booking of a requested duration can fit.
# def find_next_available_slot(
#     bookings: list[Booking],
#     booking_date: date,
#     duration_minutes: int
# ):
#     if duration_minutes <= 0:
#         raise HTTPException(
#             status_code=400,
#             detail="Duration must be greater than 0 minutes."
#         )

#     required_duration = timedelta(minutes=duration_minutes)

#     print("duration min: ", duration_minutes)
#     print("required_duration (converted): ", required_duration)

#     current_time = datetime.combine(
#         booking_date,          # this will return date -- if bookings is present, then pick the date from 1st booking; else pick date using today()
#         WORK_START          # this will provide start time
#     )

#     working_end = datetime.combine(
#         booking_date, 
#         WORK_END
#     )

#     for booking in bookings:

#         booking_start = datetime.combine(
#             booking.date,
#             booking.start_time
#         )

#         booking_end = datetime.combine(
#             booking.date,
#             booking.end_time
#         )

#         # If the free gap before this booking is large enough,
#         # this is the earliest possible slot.
#         if booking_start - current_time >= required_duration:
#             return {
#                 "start_time": current_time.time(),
#                 "end_time": (
#                     current_time + required_duration
#                 ).time()
#             }


#         if booking_end > current_time:
#             current_time = booking_end

#     working_end = datetime.combine(
#         bookings[0].date if bookings else datetime.today().date(),
#         WORK_END
#     )

#     if working_end - current_time >= required_duration:
#         return current_time.time(), (
#             current_time + required_duration
#         ).time()

#     return None





def find_next_available_slot(
    bookings: list[Booking],
    booking_date: date,
    duration_minutes: int
):
    if duration_minutes <= 0:
        raise HTTPException(
            status_code=400,
            detail="Duration must be greater than 0 minutes."
        )

    required_duration = timedelta(minutes=duration_minutes)

    current_time = datetime.combine(
        booking_date,
        WORK_START
    )

    working_end = datetime.combine(
        booking_date,
        WORK_END
    )

    for booking in bookings:
        booking_start = datetime.combine(
            booking_date,
            booking.start_time
        )

        booking_end = datetime.combine(
            booking_date,
            booking.end_time
        )

        # The first gap large enough for the requested duration is
        # automatically the earliest possible available slot.
        if booking_start - current_time >= required_duration:
            return {
                "start_time": current_time.time(),
                "end_time": (
                    current_time + required_duration
                ).time()
            }

        if booking_end > current_time:
            current_time = booking_end

    # After checking all existing bookings, there may still be
    # enough free time before the working day ends.
    if working_end - current_time >= required_duration:
        return {
            "start_time": current_time.time(),
            "end_time": (
                current_time + required_duration
            ).time()
        }

    return None