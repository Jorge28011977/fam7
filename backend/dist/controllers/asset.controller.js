"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAssetStatus = exports.getAssetById = exports.getAssets = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getAssets = async (req, res) => {
    try {
        const assets = await prisma_1.default.asset.findMany({
            include: { provider: true },
        });
        res.json(assets);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener activos', error });
    }
};
exports.getAssets = getAssets;
const getAssetById = async (req, res) => {
    const { id } = req.params;
    try {
        const asset = await prisma_1.default.asset.findUnique({
            where: { id },
            include: { provider: true, tickets: true },
        });
        if (!asset)
            return res.status(404).json({ message: 'Activo no encontrado' });
        res.json(asset);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el activo', error });
    }
};
exports.getAssetById = getAssetById;
const updateAssetStatus = async (req, res) => {
    const { id } = req.params;
    const { status, healthScore } = req.body;
    try {
        const asset = await prisma_1.default.asset.update({
            where: { id },
            data: { status, healthScore },
        });
        res.json(asset);
    }
    catch (error) {
        res.status(400).json({ message: 'Error al actualizar el activo', error });
    }
};
exports.updateAssetStatus = updateAssetStatus;
