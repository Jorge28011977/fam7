# Plataforma SaaS de Monitorización Bancaria

Esta plataforma SaaS está diseñada para bancos que necesitan monitorizar hardware como cajeros automáticos (ATMs), recicladores de billetes y contadoras. Proporciona monitorización en tiempo real, auditoría automática de SLAs, predicción de fallos mediante IA, y dashboards interactivos para gestores.

## Características Principales

- **Monitorización en Tiempo Real**: Agentes hardware que recopilan datos vía SNMP y XFS.
- **Auditoría Automática**: Creación automática de órdenes de trabajo y cálculo de penalizaciones por incumplimiento de SLA.
- **Predicción de Fallos**: Modelo de machine learning que predice fallos críticos con 7 días de antelación.
- **Dashboard Interactivo**: Interfaz React con mapas de calor, rankings de proveedores y reportes de ahorro.
- **Seguridad Bancaria**: Cifrado AES-256, firmas digitales, y cumplimiento con estándares de ciberseguridad.

## Arquitectura

La plataforma sigue una arquitectura de microservicios con capas claras:

- **Agentes Hardware** (Python): Recopilación de datos en las máquinas.
- **Backend** (Python/Node.js): Lógica de negocio y APIs.
- **Base de Datos** (PostgreSQL): Almacenamiento relacional de datos.
- **Motor ML** (Scikit-learn): Predicciones.
- **Frontend** (React): Dashboards.

## Instalación y Configuración

### Prerrequisitos

- Python 3.8+
- Node.js 14+
- PostgreSQL
- Git

### Clonación del Repositorio

```bash
git clone https://github.com/Jorge28011977/fam7.git
cd fam7
```

### Configuración del Backend

1. Instalar dependencias:

   ```bash
   pip install -r requirements.txt
   ```

2. Configurar base de datos PostgreSQL y ejecutar el esquema DDL de `architecture_and_database.md`.
3. Ejecutar el motor de auditoría:

   ```bash
   python backend/audit_engine.py
   ```

### Configuración del Agente Hardware

1. Instalar dependencias:

   ```bash
   pip install pysnmp cryptography requests
   ```

2. Configurar variables en `agents/hardware_agent.py` (API endpoint, claves, etc.).
3. Ejecutar el agente:

   ```bash
   python agents/hardware_agent.py
   ```

### Configuración del Motor ML

1. Instalar dependencias:

   ```bash
   pip install scikit-learn pandas joblib
   ```

2. Entrenar el modelo:

   ```bash
   python ml/predictive_model.py
   ```

### Configuración del Frontend

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Ejecutar la aplicación:

   ```bash
   npm start
   ```

## Pruebas

Ejecutar los tests unitarios:

```bash
python -m unittest tests/test_audit.py
```

## Documentación

- [Arquitectura y Base de Datos](architecture_and_database.md)
- [Documentación de Seguridad](docs/security_documentation.md)

## Contribución

1. Fork el repositorio.
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3. Commit tus cambios (`git commit -am 'Añade nueva funcionalidad'`).
4. Push a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.
