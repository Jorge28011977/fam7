import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAssets = async (req: Request, res: Response) => {
    try {
        const assets = await prisma.asset.findMany({
            include: { provider: true },
        });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener activos', error });
    }
};

export const getAssetById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const asset = await prisma.asset.findUnique({
            where: { id },
            include: { provider: true, tickets: true },
        });
        if (!asset) return res.status(404).json({ message: 'Activo no encontrado' });
        res.json(asset);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el activo', error });
    }
};

export const updateAssetStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, healthScore } = req.body;
    try {
        const asset = await prisma.asset.update({
            where: { id },
            data: { status, healthScore },
        });
        res.json(asset);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el activo', error });
    }
};
