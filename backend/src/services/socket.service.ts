import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export const initSocket = (server: HttpServer) => {
    const io = new SocketServer(server, {
        cors: {
            origin: '*', // Adjust for production
        },
    });

    io.on('connection', (socket) => {
        console.log('🔌 New client connected to Telemetry Stream:', socket.id);

        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected');
        });
    });

    return io;
};

// Simulated IoT Data Stream
export const startTelemetrySimulation = (io: SocketServer) => {
    setInterval(() => {
        const healthDrop = Math.random() > 0.8;
        const data = {
            assetId: 'random-asset-id', // In a real scenario, this would loop through active assets
            type: healthDrop ? 'ALERT' : 'TELEMETRY',
            healthScore: Math.floor(Math.random() * (100 - 40) + 40),
            timestamp: new Date(),
            message: healthDrop ? 'Possible mechanical degradation detected' : 'Normal operation',
        };

        io.emit('asset_update', data);
    }, 5000); // Send update every 5 seconds
};
