import React, { useEffect, useState } from 'react';
import { LayoutDashboard, CreditCard, Users, Settings, Bell, Search, Activity, Map as MapIcon, ShieldCheck } from 'lucide-react';
import { socket } from './socket';
import AssetMap from './components/AssetMap';
import HealthChart from './components/HealthChart';

const App = () => {
    const [lastEvent, setLastEvent] = useState<any>(null);
    const [stats, setStats] = useState({
        activeAtms: 1284,
        predictiveAlerts: 14,
        sla: 98.4,
        cashCounted: 4.2
    });

    useEffect(() => {
        socket.on('asset_update', (data) => {
            setLastEvent(data);
            if (data.type === 'ALERT') {
                setStats((prev: any) => ({ ...prev, predictiveAlerts: prev.predictiveAlerts + 1 }));
            }
        });

        return () => {
            socket.off('asset_update');
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800/50 backdrop-blur-xl border-r border-white/10 p-6 hidden lg:block">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-xl font-bold">F5</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">FAM5</h1>
                </div>

                <nav className="space-y-4">
                    {[
                        { name: 'Dashboard', icon: LayoutDashboard, active: true },
                        { name: 'Cajeros', icon: CreditCard },
                        { name: 'Proveedores', icon: Users },
                        { name: 'Ajustes', icon: Settings },
                    ].map((item) => (
                        <a
                            key={item.name}
                            href="#"
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.active
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </a>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Bienvenido a FAM5</h2>
                        <p className="text-slate-400">Monitorización predictiva de activos bancarios</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar activos..."
                                className="bg-slate-800 border border-white/10 rounded-full py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <button className="p-2 bg-slate-800 rounded-full border border-white/10 text-slate-400 hover:text-white transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 border-2 border-white/20"></div>
                    </div>
                </header>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Cajeros Activos', value: stats.activeAtms.toLocaleString(), change: '+12%', color: 'blue' },
                        { label: 'Alertas Predictivas', value: stats.predictiveAlerts.toString(), change: '+ Hoy', color: 'amber' },
                        { label: 'SLA Proveedores', value: stats.sla + '%', change: '+0.2%', color: 'emerald' },
                        { label: 'Efectivo Contado', value: '€' + stats.cashCounted + 'M', change: 'Hoy', color: 'indigo' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-slate-800/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-blue-500/30 transition-all group">
                            <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                                    stat.color === 'amber' ? 'bg-amber-500/10 text-amber-400' :
                                        stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                                            'bg-indigo-500/10 text-indigo-400'
                                    }`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Live Telemetry Feed */}
                {lastEvent && (
                    <div className="bg-slate-800/80 border border-blue-500/30 p-4 rounded-xl mb-10 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${lastEvent.type === 'ALERT' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                <Activity size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">Telemetría en Vivo: {lastEvent.type}</p>
                                <p className="text-xs text-slate-400">{lastEvent.message} | Score: {lastEvent.healthScore}%</p>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono italic">Sincronizado vía Socket.io</span>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Left Column: Health Chart */}
                    <div className="lg:col-span-1">
                        <HealthChart />
                    </div>

                    {/* Center Column: Map */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-white font-bold flex items-center gap-2">
                                    <MapIcon size={18} className="text-blue-400" />
                                    Distribución de Activos
                                </h4>
                                <span className="text-xs text-slate-400">Ver Mapa Completo</span>
                            </div>
                            <AssetMap />
                        </div>
                    </div>
                </div>

                {/* Coming Soon Message */}
                <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-12 text-center backdrop-blur-xl">
                    <h3 className="text-4xl font-extrabold text-white mb-4">Construyendo el futuro de la banca</h3>
                    <p className="text-slate-300 max-w-2xl mx-auto text-lg mb-8">
                        FAM5 está siendo configurado. Estamos desplegando la infraestructura en Hetzner CPX42 para garantizar el máximo rendimiento y escalabilidad.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-blue-500 px-6 py-3 rounded-full font-bold text-white shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform cursor-pointer">
                        <span>Ver Hoja de Ruta</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
