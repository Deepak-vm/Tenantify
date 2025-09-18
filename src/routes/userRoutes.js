import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from "./src/db/db.js"
import { prisma } from '../db/db';
import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';

const prisma = new PrismaClient();
const router = express.Router();


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = prisma.user.findUnique({
        where: { email }
    })
    if (!user) {
        return res.status(401).json({
            error: "Invalid email or password"
        })
    }

    const validUser = await bcrypt.compare(password, user.password);
    if (!validUser) {
        return res.status(401).json(
            {
                error: "Invalid email or password"
            }
        )
    }
    const token = jwt.sign({
        userId: user.userId,
        tenantId: user.tenant,
        role: user.role
    }, process.env.JWT_SECRET,
        { expiresIn: '1h' })
    res.json({ token })

})

// Get all users (Admin only)
router.get('/', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                tenantId: req.tenantId // Only users from same tenant
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        domain: true
                    }
                }
            }
        });

        res.json({
            message: 'Users retrieved successfully',
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: {
                id,
                tenantId: req.tenantId // Ensure user belongs to same tenant
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        domain: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            message: 'User retrieved successfully',
            user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

export default router;
