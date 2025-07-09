import psycopg2
import os

POSTGRES_DSN = os.getenv("POSTGRES_DSN", "dbname=orchestra user=postgres password=postgres host=localhost")

def get_conn():
    return psycopg2.connect(POSTGRES_DSN)

def save_workflow(workflow_id, workflow_json):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO workflows (workflow_id, workflow_json)
                VALUES (%s, %s)
                ON CONFLICT (workflow_id) DO UPDATE SET workflow_json = EXCLUDED.workflow_json
            """, (workflow_id, workflow_json))
            conn.commit()

def get_workflow(workflow_id):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT workflow_json FROM workflows WHERE workflow_id = %s", (workflow_id,))
            row = cur.fetchone()
            return row[0] if row else None
# Add similar helpers for runs, logs, etc.
