import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import assetRoutes from './routes/asset.routes';
import ticketRoutes from './routes/ticket.routes';
import auditRoutes from './routes/audit.routes';
import { initSocket, startTelemetrySimulation } from './services/socket.service';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = initSocket(httpServer);
const PORT = process.env.PORT || 5000;

// Start IoT Simulation
startTelemetrySimulation(io);

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'FAM5 API is running', timestamp: new Date() });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 FAM5 Backend running on port ${PORT}`);
});
