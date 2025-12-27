import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const options = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
        }
    },
    scales: {
        y: {
            grid: {
                color: 'rgba(255,255,255,0.05)',
            },
            ticks: {
                color: '#64748b',
            }
        },
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#64748b',
            }
        }
    },
};

const labels = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

const data = {
    labels,
    datasets: [
        {
            fill: true,
            label: 'Salud Promedio',
            data: [98, 97, 95, 92, 94, 88, 85],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
        },
    ],
};

const HealthChart = () => {
    return (
        <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl h-full">
            <h4 className="text-white font-bold mb-4">Análisis de Salud Predictiva (%)</h4>
            <div className="h-[250px]">
                <Line options={options} data={data} />
            </div>
        </div>
    );
};

export default HealthChart;
