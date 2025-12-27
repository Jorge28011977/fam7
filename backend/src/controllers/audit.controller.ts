import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const validateCheckIn = async (req: any, res: Response) => {
    const { ticketId, qrCode, lat, lng } = req.body;

    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: { asset: true }
        });

        if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });

        // 1. QR Validation
        if (ticket.validationCode && ticket.validationCode !== qrCode) {
            return res.status(400).json({ message: 'Código QR inválido para este activo' });
        }

        // 2. Geo Validation (Simple range check - 100 meters)
        if (lat && lng && ticket.asset.coordinates) {
            const [assetLat, assetLng] = ticket.asset.coordinates.split(',').map(Number);
            const distance = Math.sqrt(Math.pow(lat - assetLat, 2) + Math.pow(lng - assetLng, 2));

            // Rough approximation: 0.001 degrees is ~111 meters
            if (distance > 0.001) {
                return res.status(400).json({ message: 'El técnico no se encuentra en la ubicación del activo' });
            }
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticketId },
            data: { status: 'IN_PROGRESS' }
        });

        // Log the audit
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'CHECK_IN_VALIDATED',
                entity: 'TICKET',
                entityId: ticketId,
                details: `Técnico validado mediante ${qrCode ? 'QR' : 'Geo'}`
            }
        });

        res.json({ message: 'Check-in validado correctamente', ticket: updatedTicket });
    } catch (error) {
        res.status(500).json({ message: 'Error en la validación', error });
    }
};

export const getProviderSLA = async (req: Request, res: Response) => {
    const { providerId } = req.params;

    try {
        const tickets = await prisma.ticket.findMany({
            where: { providerId, status: 'CLOSED' },
            select: { createdAt: true, closedAt: true }
        });

        if (tickets.length === 0) return res.json({ slaScore: 100, pendingTickets: 0 });

        const totalResponseTime = tickets.reduce((acc: number, t: any) => {
            const diff = t.closedAt!.getTime() - t.createdAt.getTime();
            return acc + diff;
        }, 0);

        const avgResponseHours = totalResponseTime / tickets.length / (1000 * 60 * 60);

        // SLA logic: Less than 4 hours is 100%, more than 24 hours is 0%
        let slaScore = 100 - (avgResponseHours * 4);
        slaScore = Math.max(0, Math.min(100, slaScore));

        res.json({
            slaScore: Math.round(slaScore),
            avgResponseHours: avgResponseHours.toFixed(2),
            totalResolved: tickets.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al calcular SLA', error });
    }
};
