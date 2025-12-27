"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const asset_routes_1 = __importDefault(require("./routes/asset.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const socket_service_1 = require("./services/socket.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = (0, socket_service_1.initSocket)(httpServer);
const PORT = process.env.PORT || 5000;
// Start IoT Simulation
(0, socket_service_1.startTelemetrySimulation)(io);
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/assets', asset_routes_1.default);
app.use('/api/tickets', ticket_routes_1.default);
app.use('/api/audit', audit_routes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'FAM5 API is running', timestamp: new Date() });
});
httpServer.listen(PORT, () => {
    console.log(`🚀 FAM5 Backend running on port ${PORT}`);
});
