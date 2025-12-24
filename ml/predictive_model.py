import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import time
from datetime import datetime, timedelta

# Simular datos históricos
def generate_sample_data():
    np.random.seed(42)
    dates = pd.date_range(start='2023-01-01', end='2024-01-01', freq='D')
    data = []
    for date in dates:
        for machine_id in range(1, 11):  # 10 máquinas
            minor_errors = np.random.poisson(2)  # Errores menores promedio 2 por día
            major_failure = 1 if minor_errors > 5 and np.random.random() < 0.1 else 0  # Probabilidad de fallo mayor
            data.append({
                'date': date,
                'machine_id': machine_id,
                'minor_errors': minor_errors,
                'major_failure': major_failure
            })
    df = pd.DataFrame(data)
    return df

# Entrenar modelo
def train_model():
    df = generate_sample_data()
    # Crear features: frecuencia de errores en ventanas de tiempo
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(['machine_id', 'date'])
    df['minor_errors_7d'] = df.groupby('machine_id')['minor_errors'].rolling(7).sum().reset_index(0, drop=True)
    df['minor_errors_30d'] = df.groupby('machine_id')['minor_errors'].rolling(30).sum().reset_index(0, drop=True)
    df = df.dropna()

    X = df[['minor_errors_7d', 'minor_errors_30d']]
    y = df['major_failure']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(f"Accuracy: {accuracy_score(y_test, y_pred)}")

    joblib.dump(model, 'failure_prediction_model.pkl')
    return model

# Predecir fallo en 7 días
def predict_failure(machine_id, recent_data):
    model = joblib.load('failure_prediction_model.pkl')
    # recent_data: dict con minor_errors_7d, minor_errors_30d
    X = pd.DataFrame([recent_data])
    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0][1]
    return prediction, probability

# Calcular Health Score (0-100)
def calculate_health_score(machine_id):
    # Simular historial de 30 días
    minor_errors_30d = np.random.poisson(60)  # Total errores menores en 30 días
    # Score basado en frecuencia: menos errores = mayor score
    score = max(0, 100 - (minor_errors_30d / 3))  # Penalizar por cada 3 errores
    return min(100, score)

# Ejemplo de uso
if __name__ == '__main__':
    # Entrenar modelo
    model = train_model()

    # Predecir para una máquina
    recent = {'minor_errors_7d': 10, 'minor_errors_30d': 50}
    pred, prob = predict_failure(1, recent)
    print(f"Predicción de fallo en 7 días: {pred}, Probabilidad: {prob:.2f}")

    # Health score
    score = calculate_health_score(1)
    print(f"Health Score para máquina 1: {score}")