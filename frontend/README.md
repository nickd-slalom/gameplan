# Frontend

React application boundary for organizer, host, and attendee workflows.

## Local Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend reads API requests from the same origin by default. Set
`VITE_API_BASE_URL` in a local `.env` file when the Django API runs on a
different origin.
