"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketStatus = exports.getTickets = exports.createTicket = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createTicket = async (req, res) => {
    const { subject, description, assetId, priority } = req.body;
    try {
        const asset = await prisma_1.default.asset.findUnique({ where: { id: assetId } });
        if (!asset)
            return res.status(404).json({ message: 'Activo no encontrado' });
        const ticket = await prisma_1.default.ticket.create({
            data: {
                subject,
                description,
                assetId,
                priority: priority || 1,
                providerId: asset.providerId,
            }
        });
        res.status(201).json(ticket);
    }
    catch (error) {
        res.status(400).json({ message: 'Error al crear ticket', error });
    }
};
exports.createTicket = createTicket;
const getTickets = async (req, res) => {
    try {
        const where = req.user.role === 'TECHNICIAN' ? { technicianId: req.user.id } : {};
        const tickets = await prisma_1.default.ticket.findMany({
            where,
            include: { asset: true, provider: true, technician: true },
        });
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener tickets', error });
    }
};
exports.getTickets = getTickets;
const updateTicketStatus = async (req, res) => {
    const { id } = req.params;
    const { status, technicianId } = req.body;
    try {
        const ticket = await prisma_1.default.ticket.update({
            where: { id },
            data: {
                status,
                technicianId,
                closedAt: status === 'CLOSED' ? new Date() : null
            }
        });
        res.json(ticket);
    }
    catch (error) {
        res.status(400).json({ message: 'Error al actualizar ticket', error });
    }
};
exports.updateTicketStatus = updateTicketStatus;
