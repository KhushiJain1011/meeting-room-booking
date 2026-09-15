
from sqlalchemy.orm import Session

from datetime import date, time
from fastapi import HTTPException

from pydantic import BaseModel, Field
from .models import Booking


class BookingCreate(BaseModel):
    room_id: int
    title: str = Field(min_length=1, max_length=200)
    date: date
    start_time: time
    end_time: time


class BookingResponse(BaseModel):
    id: int
    room_id: int
    title: str
    date: date
    start_time: time
    end_time: time

    class Config:
        from_attributes = True


class RoomResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True