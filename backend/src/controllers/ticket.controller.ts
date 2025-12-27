import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createTicket = async (req: any, res: Response) => {
    const { subject, description, assetId, priority } = req.body;

    try {
        const asset = await prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset) return res.status(404).json({ message: 'Activo no encontrado' });

        const ticket = await prisma.ticket.create({
            data: {
                subject,
                description,
                assetId,
                priority: priority || 1,
                providerId: asset.providerId!,
            }
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear ticket', error });
    }
};

export const getTickets = async (req: any, res: Response) => {
    try {
        const where = req.user.role === 'TECHNICIAN' ? { technicianId: req.user.id } : {};
        const tickets = await prisma.ticket.findMany({
            where,
            include: { asset: true, provider: true, technician: true },
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tickets', error });
    }
};

export const updateTicketStatus = async (req: any, res: Response) => {
    const { id } = req.params;
    const { status, technicianId } = req.body;

    try {
        const ticket = await prisma.ticket.update({
            where: { id },
            data: {
                status,
                technicianId,
                closedAt: status === 'CLOSED' ? new Date() : null
            }
        });
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar ticket', error });
    }
};
