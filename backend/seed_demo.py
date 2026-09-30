from app.main import simulate
from app.database import init_db

init_db()
simulate()

print("Demo data created in Neon PostgreSQL.")