import { PrismaClient, Role, AssetType, AssetStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 1. Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@fam5.com' },
        update: {},
        create: {
            email: 'admin@fam5.com',
            password: hashedPassword,
            name: 'Director FAM5',
            role: Role.ADMIN,
        },
    });

    // 2. Create a Provider
    const provider = await prisma.provider.upsert({
        where: { name: 'TechServ Global' },
        update: {},
        create: {
            name: 'TechServ Global',
            contactEmail: 'support@techserv.com',
            phone: '+34 900 000 000',
        },
    });

    // 3. Create Sample Assets
    await prisma.asset.upsert({
        where: { serialNumber: 'ATM-2025-001' },
        update: {},
        create: {
            serialNumber: 'ATM-2025-001',
            model: 'NCR SelfServ 80',
            brand: 'NCR',
            type: AssetType.ATM,
            status: AssetStatus.OPERATIONAL,
            location: 'Sucursal Central, Madrid',
            healthScore: 98,
            providerId: provider.id,
        },
    });

    await prisma.asset.upsert({
        where: { serialNumber: 'CONT-2025-042' },
        update: {},
        create: {
            serialNumber: 'CONT-2025-042',
            model: 'Glory GFS-220',
            brand: 'Glory',
            type: AssetType.BILL_COUNTER,
            status: AssetStatus.WARNING,
            location: 'Oficina 402, Barcelona',
            healthScore: 65,
            providerId: provider.id,
        },
    });

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
