import time
import json
import sqlite3  # Simulando DB, en producción usar PostgreSQL
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import schedule
import threading

# Simulación de DB (en producción, usar psycopg2 para PostgreSQL)
def init_db():
    conn = sqlite3.connect('audit.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS work_orders (
                    id INTEGER PRIMARY KEY,
                    event_id INTEGER,
                    provider_id INTEGER,
                    status TEXT DEFAULT 'open',
                    opened_at REAL,
                    arrived_at REAL,
                    resolved_at REAL,
                    penalty REAL DEFAULT 0
                )''')
    c.execute('''CREATE TABLE IF NOT EXISTS slas (
                    id INTEGER PRIMARY KEY,
                    provider_id INTEGER,
                    response_time_hours INTEGER,
                    penalty_per_hour REAL
                )''')
    # Insertar datos de ejemplo
    c.execute("INSERT OR IGNORE INTO slas (provider_id, response_time_hours, penalty_per_hour) VALUES (1, 4, 100.0)")
    conn.commit()
    conn.close()

def get_sla(provider_id):
    conn = sqlite3.connect('audit.db')
    c = conn.cursor()
    c.execute("SELECT response_time_hours, penalty_per_hour FROM slas WHERE provider_id = ?", (provider_id,))
    row = c.fetchone()
    conn.close()
    return row if row else (4, 100.0)  # Default

def create_work_order(event_id, provider_id):
    conn = sqlite3.connect('audit.db')
    c = conn.cursor()
    opened_at = time.time()
    c.execute("INSERT INTO work_orders (event_id, provider_id, opened_at) VALUES (?, ?, ?)", (event_id, provider_id, opened_at))
    wo_id = c.lastrowid
    conn.commit()
    conn.close()
    print(f"OT creada: {wo_id}")
    return wo_id

def update_work_order_arrival(wo_id, arrived_at):
    conn = sqlite3.connect('audit.db')
    c = conn.cursor()
    c.execute("UPDATE work_orders SET arrived_at = ? WHERE id = ?", (arrived_at, wo_id))
    conn.commit()
    conn.close()

def close_work_order(wo_id, resolved_at):
    conn = sqlite3.connect('audit.db')
    c = conn.cursor()
    c.execute("UPDATE work_orders SET resolved_at = ?, status = 'closed' WHERE id = ?", (resolved_at, wo_id))
    conn.commit()
    conn.close()

def calculate_penalty(wo_id):
    conn = sqlite3.connect('audit.db')
    c = conn.cursor()
    c.execute("SELECT opened_at, arrived_at, provider_id FROM work_orders WHERE id = ?", (wo_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        return 0
    opened_at, arrived_at, provider_id = row
    if not arrived_at:
        return 0
    response_time_hours, penalty_per_hour = get_sla(provider_id)
    actual_response_hours = (arrived_at - opened_at) / 3600
    if actual_response_hours > response_time_hours:
        delay_hours = actual_response_hours - response_time_hours
        penalty = delay_hours * penalty_per_hour
        conn = sqlite3.connect('audit.db')
        c = conn.cursor()
        c.execute("UPDATE work_orders SET penalty = ? WHERE id = ?", (penalty, wo_id))
        conn.commit()
        conn.close()
        print(f"Penalización calculada: {penalty} para OT {wo_id}")
        return penalty
    return 0

# Procesar evento entrante
def process_event(event_data):
    event = event_data.get('event', {})
    if event.get('severity') == 'critical':
        provider_id = 1  # Asumir proveedor basado en máquina, en producción lookup
        event_id = event_data.get('id', 0)
        create_work_order(event_id, provider_id)

# Simular llegada de técnico (en producción, desde GPS/App)
def technician_arrival(wo_id):
    arrived_at = time.time()
    update_work_order_arrival(wo_id, arrived_at)
    calculate_penalty(wo_id)

# Cerrar OT solo si hay log 'Estado OK'
def close_if_ok(wo_id, ok_log_received):
    if ok_log_received:
        resolved_at = time.time()
        close_work_order(wo_id, resolved_at)
        print(f"OT {wo_id} cerrada")

# Generar reporte mensual PDF
def generate_monthly_report():
    conn = sqlite3.connect('audit.db')
    c = conn.cursor()
    # Suma de penalizaciones por proveedor
    c.execute("SELECT provider_id, SUM(penalty) FROM work_orders WHERE strftime('%Y-%m', datetime(opened_at, 'unixepoch')) = strftime('%Y-%m', 'now') GROUP BY provider_id")
    penalties = c.fetchall()
    conn.close()

    filename = f"reporte_penalizaciones_{datetime.now().strftime('%Y_%m')}.pdf"
    c = canvas.Canvas(filename, pagesize=letter)
    c.drawString(100, 750, "Reporte Mensual de Penalizaciones")
    y = 700
    for provider_id, total_penalty in penalties:
        c.drawString(100, y, f"Proveedor {provider_id}: ${total_penalty:.2f}")
        y -= 20
    c.save()
    print(f"Reporte generado: {filename}")

# Cron job para verificar SLAs y generar reportes
def cron_jobs():
    schedule.every().day.at("23:59").do(generate_monthly_report)
    # Otros checks
    while True:
        schedule.run_pending()
        time.sleep(60)

# Simulación
def simulate():
    # Evento crítico
    process_event({'id': 1, 'event': {'severity': 'critical'}})
    time.sleep(2)
    # Técnico llega tarde
    technician_arrival(1)
    time.sleep(1)
    # Cerrar con OK
    close_if_ok(1, True)

if __name__ == '__main__':
    init_db()
    # Iniciar cron en hilo separado
    threading.Thread(target=cron_jobs, daemon=True).start()
    # Simular
    simulate()