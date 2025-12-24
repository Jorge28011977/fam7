import time
import json
import sqlite3
import requests
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization
from cryptography.fernet import Fernet
from pysnmp.hlapi import *
import random  # Para simular eventos XFS

# Configuración
API_ENDPOINT = 'https://api.monitoring-bank.com/events'
ENCRYPTION_KEY = Fernet.generate_key()  # En producción, cargar de config segura
PRIVATE_KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)
PUBLIC_KEY = PRIVATE_KEY.public_key()
MACHINE_ID = 'ATM-001'  # ID único de la máquina
SNMP_TARGET = '192.168.1.100'  # IP del dispositivo SNMP
SNMP_COMMUNITY = 'public'

# Base de datos local para buffer
def init_db():
    conn = sqlite3.connect('buffer.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY,
                    data TEXT,
                    timestamp REAL
                )''')
    conn.commit()
    conn.close()

def buffer_event(data):
    conn = sqlite3.connect('buffer.db')
    c = conn.cursor()
    c.execute("INSERT INTO events (data, timestamp) VALUES (?, ?)", (json.dumps(data), time.time()))
    conn.commit()
    conn.close()

def get_buffered_events():
    conn = sqlite3.connect('buffer.db')
    c = conn.cursor()
    c.execute("SELECT id, data FROM events ORDER BY timestamp")
    rows = c.fetchall()
    conn.close()
    return rows

def remove_buffered_event(event_id):
    conn = sqlite3.connect('buffer.db')
    c = conn.cursor()
    c.execute("DELETE FROM events WHERE id = ?", (event_id,))
    conn.commit()
    conn.close()

# Cifrado AES-256
def encrypt_data(data):
    f = Fernet(ENCRYPTION_KEY)
    return f.encrypt(json.dumps(data).encode()).decode()

# Firma digital
def sign_data(data):
    signature = PRIVATE_KEY.sign(
        data.encode(),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    return signature.hex()

# Leer eventos vía SNMP v3
def read_snmp_events():
    events = []
    iterator = getCmd(
        SnmpEngine(),
        CommunityData(SNMP_COMMUNITY),
        UdpTransportTarget((SNMP_TARGET, 161)),
        ContextData(),
        ObjectType(ObjectIdentity('SNMPv2-MIB', 'sysDescr', 0))
    )
    for (errorIndication, errorStatus, errorIndex, varBinds) in iterator:
        if errorIndication:
            print(f"SNMP Error: {errorIndication}")
        elif errorStatus:
            print(f"SNMP Error: {errorStatus}")
        else:
            for varBind in varBinds:
                # Simular detección de errores
                if 'error' in str(varBind).lower():
                    events.append({
                        'type': 'snmp_error',
                        'description': str(varBind),
                        'severity': 'high'
                    })
    return events

# Simular escucha de extensiones XFS
def simulate_xfs_events():
    events = []
    # Simular patrones de error
    error_patterns = [
        'Sensor de salida obstruido',
        'Fallo de comunicación en rodillo',
        'Atasco en dispensador',
        'Puerta abierta sin autorización'
    ]
    if random.random() < 0.1:  # 10% chance de error
        event = {
            'type': 'xfs_error',
            'description': random.choice(error_patterns),
            'severity': 'critical' if 'Fallo' in random.choice(error_patterns) else 'medium'
        }
        events.append(event)
    return events

# Enviar datos a API central
def send_to_api(data):
    try:
        encrypted_data = encrypt_data(data)
        signature = sign_data(encrypted_data)
        payload = {
            'machine_id': MACHINE_ID,
            'data': encrypted_data,
            'signature': signature
        }
        response = requests.post(API_ENDPOINT, json=payload, timeout=10)
        if response.status_code == 200:
            print("Evento enviado exitosamente")
            return True
        else:
            print(f"Error al enviar: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Error de conexión: {e}")
        return False

# Procesar eventos
def process_events():
    events = read_snmp_events() + simulate_xfs_events()
    for event in events:
        data = {
            'machine_id': MACHINE_ID,
            'timestamp': time.time(),
            'event': event
        }
        if not send_to_api(data):
            buffer_event(data)

# Enviar eventos bufferizados
def send_buffered_events():
    events = get_buffered_events()
    for event_id, data_str in events:
        data = json.loads(data_str)
        if send_to_api(data):
            remove_buffered_event(event_id)

# Heartbeat
def send_heartbeat():
    data = {
        'machine_id': MACHINE_ID,
        'type': 'heartbeat',
        'timestamp': time.time()
    }
    if not send_to_api(data):
        buffer_event(data)

# Bucle principal
def main():
    init_db()
    while True:
        process_events()
        send_buffered_events()
        send_heartbeat()
        time.sleep(60)  # Cada minuto

if __name__ == '__main__':
    main()