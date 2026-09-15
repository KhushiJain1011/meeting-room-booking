from sqlalchemy.orm import Session

from .models import Booking, Room

# fetch all rooms and sort by room id:
def get_rooms(db: Session):
    return db.query(Room).order_by(Room.id).all()

# get single (specific) room with given room id:
def get_room(db: Session, room_id: int):
    return db.query(Room).filter(Room.id == room_id).first()

# get all bookings for a particular date with given room id (room id - optional):
def get_bookings(db: Session, booking_date, room_id=None):
    # filter all bookings by date first: 
    query = db.query(Booking).filter(
        Booking.date == booking_date
    )

    # if room id is not none, then find those bookings where room id is same as the input room id: 
    if room_id is not None:
        query = query.filter(Booking.room_id == room_id)

    # return bookings sorted by start time:
    return query.order_by(
        Booking.start_time
    ).all()

# create a new booking:
def create_booking(db: Session, booking_data):
    booking = Booking(**booking_data)

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking

# get particular booking with booking id:
def get_booking(db: Session, booking_id: int):
    return (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

# delete booking with bookingid:
def delete_booking(db: Session, booking: Booking):
    db.delete(booking)
    db.commit()