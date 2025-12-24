import unittest
import sqlite3
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend import audit_engine
from backend.audit_engine import init_db, create_work_order, update_work_order_arrival, calculate_penalty, get_sla

class TestAuditEngine(unittest.TestCase):

    def setUp(self):
        # Usar DB de archivo para tests
        self.db_path = 'test_audit.db'
        audit_engine.DB_PATH = self.db_path
        self.conn = sqlite3.connect(self.db_path)
        c = self.conn.cursor()
        c.execute('''CREATE TABLE work_orders (
                        id INTEGER PRIMARY KEY,
                        event_id INTEGER,
                        provider_id INTEGER,
                        status TEXT DEFAULT 'open',
                        opened_at REAL,
                        arrived_at REAL,
                        resolved_at REAL,
                        penalty REAL DEFAULT 0
                    )''')
        c.execute('''CREATE TABLE slas (
                        id INTEGER PRIMARY KEY,
                        provider_id INTEGER,
                        response_time_hours INTEGER,
                        penalty_per_hour REAL
                    )''')
        c.execute("INSERT INTO slas (provider_id, response_time_hours, penalty_per_hour) VALUES (1, 4, 100.0)")
        self.conn.commit()

    def tearDown(self):
        self.conn.close()
        os.remove(self.db_path)

    def test_get_sla(self):
        sla = get_sla(1)
        self.assertEqual(sla, (4, 100.0))

    def test_calculate_penalty_no_delay(self):
        # Insertar OT
        c = self.conn.cursor()
        opened_at = 1000000000  # Timestamp fijo
        arrived_at = opened_at + 2 * 3600  # 2 horas, dentro del SLA
        c.execute("INSERT INTO work_orders (event_id, provider_id, opened_at, arrived_at) VALUES (?, ?, ?, ?)", (1, 1, opened_at, arrived_at))
        wo_id = c.lastrowid
        self.conn.commit()

        penalty = calculate_penalty(wo_id)
        self.assertEqual(penalty, 0)

    def test_calculate_penalty_with_delay(self):
        # Insertar OT
        c = self.conn.cursor()
        opened_at = 1000000000
        arrived_at = opened_at + 6 * 3600  # 6 horas, 2 horas de retraso
        c.execute("INSERT INTO work_orders (event_id, provider_id, opened_at, arrived_at) VALUES (?, ?, ?, ?)", (1, 1, opened_at, arrived_at))
        wo_id = c.lastrowid
        self.conn.commit()

        penalty = calculate_penalty(wo_id)
        expected_penalty = 2 * 100.0  # 2 horas * 100 por hora
        self.assertEqual(penalty, expected_penalty)

    def test_calculate_penalty_no_arrival(self):
        # Sin llegada, no penalización
        c = self.conn.cursor()
        opened_at = 1000000000
        c.execute("INSERT INTO work_orders (event_id, provider_id, opened_at) VALUES (?, ?, ?)", (1, 1, opened_at))
        wo_id = c.lastrowid
        self.conn.commit()

        penalty = calculate_penalty(wo_id)
        self.assertEqual(penalty, 0)

if __name__ == '__main__':
    unittest.main()