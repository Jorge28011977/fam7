import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './App.css';

function App() {
    const [machines, setMachines] = useState([]);
    const [providers, setProviders] = useState([]);
    const [savings, setSavings] = useState(0);

    useEffect(() => {
        // Simular fetch de API
        setMachines([
            { id: 1, lat: 40.7128, lng: -74.0060, health: 85 },
            { id: 2, lat: 34.0522, lng: -118.2437, health: 92 },
            // Más máquinas
        ]);
        setProviders([
            { id: 1, name: 'Proveedor A', efficiency: 95, slaCompliance: 98 },
            { id: 2, name: 'Proveedor B', efficiency: 88, slaCompliance: 92 },
        ]);
        setSavings(15000); // Simulado
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold text-center mb-8">Dashboard de Auditoría Bancaria</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <HeatMap machines={machines} />
                <ProviderRankings providers={providers} />
                <SavingsPanel savings={savings} />
            </div>
            <div className="mt-8">
                <AvailabilityChart />
            </div>
        </div>
    );
}

function HeatMap({ machines }) {
    // Simular mapa de calor con colores basados en health
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Mapa de Calor de Máquinas</h2>
            <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
                {/* Placeholder para mapa interactivo */}
                <p>Mapa interactivo aquí (usar Leaflet)</p>
                <ul>
                    {machines.map(m => (
                        <li key={m.id}>Máquina {m.id}: Salud {m.health}%</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function ProviderRankings({ providers }) {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Rankings de Proveedores</h2>
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="text-left">Proveedor</th>
                        <th>Eficiencia</th>
                        <th>Cumplimiento SLA</th>
                    </tr>
                </thead>
                <tbody>
                    {providers.map(p => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.efficiency}%</td>
                            <td>{p.slaCompliance}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SavingsPanel({ savings }) {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Ahorro Generado</h2>
            <p className="text-2xl font-bold text-green-600">${savings.toLocaleString()}</p>
            <p>en penalizaciones automáticas</p>
        </div>
    );
}

function AvailabilityChart() {
    const data = [
        { month: 'Ene', real: 98, promised: 99.5 },
        { month: 'Feb', real: 97, promised: 99.5 },
        { month: 'Mar', real: 99, promised: 99.5 },
    ];

    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Disponibilidad Real vs Prometida</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="real" stroke="#8884d8" />
                    <Line type="monotone" dataKey="promised" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default App;