# Meeting Room Booking System

A simple and responsive Meeting Room Booking System that allows users to view meeting rooms, check bookings for a selected date, create new bookings, cancel existing bookings, filter bookings by room, and find the next available time slot.

The application follows the required working hours of **09:00 AM to 06:00 PM** and prevents overlapping bookings while allowing back-to-back bookings.

---

## Features

* View all available meeting rooms
* View bookings for a selected date
* Filter bookings by room
* Create a new meeting room booking
* Cancel an existing booking
* Validate booking start and end times
* Restrict bookings to working hours: **09:00–18:00**
* Prevent overlapping bookings
* Allow back-to-back bookings

  * Example: `10:00–11:00` and `11:00–12:00`
* Return the existing booking responsible for a conflict
* Find the next available time slot for a requested duration
* Handle gaps before, between, and after existing bookings
* Handle fully booked rooms
* API documentation using FastAPI Swagger/OpenAPI
* Responsive frontend UI
* Client-side validation
* Loading, empty, success, conflict, and error states

---

## Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Framer Motion
* Lucide React

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Uvicorn

### Database

* PostgreSQL

### Database Driver

* psycopg2-binary

---

## Project Structure

```text
meeting-room-booking/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   └── booking_logic.py
│   │
│   ├── seed.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

The backend separates database operations from booking business logic to keep the implementation simple and readable.

---

# Backend

## Backend Requirements

Make sure the following are installed:

* Python 3.10+
* PostgreSQL
* pip
* Virtual environment support

---

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

### Windows

```bash
venv\Scripts\activate
```

### macOS/Linux

```bash
source venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

---

## Backend Dependencies

The project uses:

```text
fastapi==0.141.1
uvicorn==0.53.0
SQLAlchemy==2.0.52
psycopg2-binary==2.9.13
python-dotenv==1.2.3
```

---

# PostgreSQL Setup

Create a PostgreSQL database for the application.

For example:

```text
meeting_booking
```

The application uses PostgreSQL through SQLAlchemy.

---

## Environment Variables

Create a `.env` file inside the `backend` directory:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/meeting_booking
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

Example:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/meeting_booking
```

> Do not commit the `.env` file to GitHub because it may contain database credentials.

---

# Database Initialization

The application creates the required database tables when the FastAPI application starts.

The project also contains a seed script to insert the predefined meeting rooms.

Run:

```bash
python seed.py
```

The application does not provide a room creation interface because rooms are predefined as required by the assignment.

---

# Running the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

FastAPI also provides an OpenAPI schema automatically.

---

# API Endpoints

## 1. Health Check

```http
GET /
```

Response:

```json
{
  "message": "Meeting Room Booking API is running"
}
```

---

## 2. Get All Rooms

```http
GET /api/rooms
```

Returns all predefined meeting rooms.

---

## 3. Get Bookings

```http
GET /api/bookings?date=2026-09-15
```

Returns all bookings for the selected date.

### Filter by Room

```http
GET /api/bookings?date=2026-09-15&room_id=3
```

Returns bookings for the selected date and room.

---

## 4. Create Booking

```http
POST /api/bookings
```

Request body:

```json
{
  "room_id": 1,
  "title": "Team Meeting",
  "date": "2026-09-15",
  "start_time": "10:00",
  "end_time": "11:00"
}
```

Successful response:

```text
201 Created
```

---

## 5. Cancel Booking

```http
DELETE /api/bookings/{booking_id}
```

Example:

```http
DELETE /api/bookings/1
```

Successful response:

```json
{
  "message": "Booking cancelled successfully."
}
```

If the booking does not exist:

```text
404 Not Found
```

---

## 6. Find Next Available Slot

```http
GET /api/rooms/{room_id}/next-available
```

Example:

```http
GET /api/rooms/3/next-available?date=2026-09-15&duration=45
```

Example response:

```json
{
  "room_id": 3,
  "date": "2026-09-15",
  "duration_minutes": 45,
  "start_time": "10:00:00",
  "end_time": "10:45:00"
}
```

If no suitable slot exists:

```json
{
  "message": "No available slot for the requested duration."
}
```

---

# Booking Rules

## Working Hours

All bookings must be within:

```text
09:00 - 18:00
```

Examples:

```text
08:00 - 09:30   ❌
09:00 - 10:00   ✅
17:00 - 18:00   ✅
17:00 - 19:00   ❌
```

---

## Start and End Time Validation

The end time must always be later than the start time.

```text
14:00 - 13:00   ❌
14:00 - 14:00   ❌
14:00 - 15:00   ✅
```

Invalid time ranges return:

```text
400 Bad Request
```

---

# Booking Conflict Logic

Two bookings conflict when their time ranges overlap.

The application uses the following logic:

```python
start_time < existing_booking.end_time \
and end_time > existing_booking.start_time
```

This allows back-to-back bookings.

For example:

```text
Existing booking:
10:00 ───────── 11:00

New booking:
                 11:00 ───────── 12:00

Result: Allowed
```

But an overlapping booking is rejected:

```text
Existing booking:
10:00 ───────── 11:00

New booking:
           10:30 ───────── 11:30

Result: Conflict
```

The API returns:

```text
409 Conflict
```

and identifies the booking that caused the conflict.

Example:

```json
{
  "detail": "Room is already booked from 10:00 to 11:00 for 'Team Meeting'."
}
```

---

# Next Available Slot Logic

The next-available functionality finds the earliest time during working hours where the requested duration can fit.

Working hours:

```text
09:00 ─────────────────────────────── 18:00
```

Example existing bookings:

```text
09:00 ─ 10:00
11:00 ─ 12:00
14:00 ─ 16:00
```

Available gaps:

```text
10:00 ─ 11:00
12:00 ─ 14:00
16:00 ─ 18:00
```

For a requested duration of `45` minutes:

```text
10:00 ─ 10:45
```

For `60` minutes:

```text
10:00 ─ 11:00
```

For `90` minutes:

```text
12:00 ─ 13:30
```

For `120` minutes:

```text
16:00 ─ 18:00
```

The logic checks:

1. The gap before the first booking
2. The gaps between existing bookings
3. The gap after the last booking
4. Whether the requested duration fits completely within working hours

If no suitable gap exists, the API returns:

```json
{
  "message": "No available slot for the requested duration."
}
```

The logic is implemented manually without using a scheduling library.

---

# Frontend

## Frontend Requirements

Make sure the following are installed:

* Node.js
* npm

---

## Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

## Frontend Environment Variables

Create:

```text
frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

The frontend uses this URL to communicate with the FastAPI backend.

---

# Running the Frontend

From the `frontend` directory:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:3000
```

Make sure the FastAPI backend is running at the same time.

---

# Application Flow

The application works as follows:

```text
User
 │
 ▼
Next.js Frontend
 │
 │ REST API requests
 ▼
FastAPI Backend
 │
 ├── Request validation
 ├── Booking validation
 ├── Conflict detection
 └── Next available slot calculation
 │
 ▼
SQLAlchemy
 │
 ▼
PostgreSQL
```

---

# Error Handling

The backend uses appropriate HTTP status codes.

| Status Code | Usage                         |
| ----------- | ----------------------------- |
| `200`       | Successful GET/DELETE request |
| `201`       | Booking successfully created  |
| `400`       | Invalid booking data or time  |
| `404`       | Room or booking not found     |
| `409`       | Booking time conflict         |

The frontend displays backend error messages through toast notifications so that users can understand why an operation failed.

---

# Validation

The application performs validation at both the frontend and backend levels.

### Frontend

Client-side validation provides immediate feedback before sending a request.

### Backend

FastAPI and Pydantic validate request data, while custom booking logic validates:

* Start/end time
* Working hours
* Room existence
* Booking conflicts
* Requested duration

Backend validation is still performed even if frontend validation is bypassed.

---

# Database Design

The application contains two main tables.

## Rooms

```text
rooms
├── id
└── name
```

## Bookings

```text
bookings
├── id
├── room_id
├── title
├── date
├── start_time
└── end_time
```

A booking belongs to a room through:

```text
Booking.room_id → Room.id
```

The booking date and room ID are indexed to support the filtering operations used by the application.

---

# Local Development

Start PostgreSQL first.

Then start the backend:

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Production Build

Before deployment, build the frontend:

```bash
npm run build
```

Then test the production application locally:

```bash
npm run start
```

The backend can be run using:

```bash
uvicorn app.main:app
```

---

# Deployment

The planned deployment architecture is:

```text
                 ┌───────────────────┐
                 │      Vercel       │
                 │     Next.js       │
                 └─────────┬─────────┘
                           │
                           │ REST API
                           ▼
                 ┌───────────────────┐
                 │      Render       │
                 │     FastAPI       │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │    PostgreSQL     │
                 │ Render / Neon /   │
                 │     Supabase      │
                 └───────────────────┘
```

Deployment URLs will be added here after deployment.

### Frontend

```text
Vercel URL:
TODO
```

### Backend

```text
Render URL:
TODO
```

### API Documentation

```text
Render Swagger URL:
TODO
```

---

# Known Limitations

This project intentionally focuses on the requirements of the assignment.

The current version does not include:

* User authentication
* User accounts
* Admin dashboard
* Room creation/editing
* Recurring bookings
* Email notifications
* Calendar integrations
* Real-time WebSocket updates
* Drag-and-drop scheduling

These features are outside the current project scope.

---

# Future Improvements

Possible future enhancements include:

* Authentication and role-based access
* Email/calendar notifications
* Recurring meetings
* Room capacity management
* Calendar-style booking interface
* Admin management of rooms
* Automated tests
* Better production monitoring

---

# Status

```text
Core functionality: Complete
Backend API: Complete
Database integration: Complete
Booking conflict detection: Complete
Next available slot: Complete
Frontend: Complete
Local testing: Complete
Deployment: Pending
```

---

## Author

Developed as a practical full-stack Meeting Room Booking System assignment.
