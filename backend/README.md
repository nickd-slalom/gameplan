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
