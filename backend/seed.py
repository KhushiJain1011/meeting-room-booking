from app.database import Base, SessionLocal, engine
from app.models import Room


Base.metadata.create_all(bind=engine)

db = SessionLocal()

rooms = [
    Room(name="Conference Room"),
    Room(name="Meeting Room A"),
    Room(name="Meeting Room B"),
    Room(name="Training Room"),
]

existing_rooms = db.query(Room).count()

if existing_rooms == 0:
    db.add_all(rooms)
    db.commit()
    print("Rooms created successfully.")
else:
    print("Rooms already exist.")

db.close()