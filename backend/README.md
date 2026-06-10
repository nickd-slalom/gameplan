# Backend

Django application boundary for Gameplan domain logic and APIs.

## Local Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

The default development database is SQLite so local startup does not require
checked-in secrets. Set the `DB_*` variables in `.env` to use PostgreSQL.

## Configuration

### Secret Key

- Local development: `DJANGO_DEBUG=true` (default) allows `DJANGO_SECRET_KEY` to be omitted; an insecure dev key is used.
- Production: Set `DJANGO_DEBUG=false` and provide `DJANGO_SECRET_KEY` explicitly. Startup will fail with a clear error if the key is missing.

### API Pagination

Collection endpoints (`/api/conventions/`) support bounded pagination:

- `offset`: Start position (default: 0)
- `limit`: Results per page (default: 50, max: 200)

Example:

```bash
curl "http://localhost:8000/api/conventions/?offset=0&limit=25"
```

Response includes pagination metadata:

```json
{
  "conventions": [...],
  "pagination": {
    "offset": 0,
    "limit": 25,
    "total": 150
  }
}
```
