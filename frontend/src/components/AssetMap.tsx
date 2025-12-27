import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default leaflet icons not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const assets = [
    { id: 1, name: 'ATM Central', pos: [40.4168, -3.7038], status: 'OPERATIONAL' },
    { id: 2, name: 'Contadora Oficina 402', pos: [41.3851, 2.1734], status: 'WARNING' },
];

const AssetMap = () => {
    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <MapContainer center={[40.4168, -3.7038]} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {assets.map(asset => (
                    <Marker key={asset.id} position={asset.pos as any}>
                        <Popup>
                            <div className="text-slate-900">
                                <p className="font-bold">{asset.name}</p>
                                <p className="text-xs">Estado: <span className={asset.status === 'OPERATIONAL' ? 'text-emerald-600' : 'text-amber-600'}>{asset.status}</span></p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default AssetMap;
