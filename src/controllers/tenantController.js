import { prisma } from "../db/db.js";
import { hashPassword } from "../utils/auth.js";

export const createTenant = async (req, res) => {
    try {
        const { tenantName, tenantDomain, adminEmail, adminPassword, adminName } = req.body;

        if (!tenantName || !tenantDomain || !adminEmail || !adminPassword || !adminName) {
            return res.status(400).json({ error: "Missing Required Fields" });
        }

        const existingTenant = await prisma.tenant.findUnique({
            where: { domain: tenantDomain }
        })
        if (existingTenant) {
            return res.status(409).json({
                error: "Tenant domain already exists"
            });
        }
        const hashedPassword = await hashPassword(adminPassword);

        // Create slug from tenant name (lowercase, replace spaces with hyphens)
        const slug = tenantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const result = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: tenantName,
                    slug: slug,
                    domain: tenantDomain
                    
                }
            });

            // Create admin user
            const adminUser = await tx.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    name: adminName,
                    role: 'ADMIN',
                    tenantId: tenant.id
                }
            });

            return { tenant, adminUser };
        });

        const { password, ...adminUserResponse } = result.adminUser;

        res.status(201).json({
            message: 'Tenant and admin user created successfully',
            tenant: result.tenant,
            adminUser: adminUserResponse
        });

    } catch (error) {
        console.error('Error creating tenant:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};