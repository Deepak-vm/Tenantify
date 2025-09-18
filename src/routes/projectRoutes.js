import express from "express";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";
import { prisma } from "../db/db.js";

const router = express.Router();

// Get all projects for the tenant
router.get("/", authMiddleware, async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                tenantId: req.tenantId,
            },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        res.json({
            message: "Projects retrieved successfully",
            projects,
        });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
});

// Create a new project
router.post(
    "/",
    authMiddleware,
    requireRole(["ADMIN", "MANAGER"]),
    async (req, res) => {
        try {
            const { name, description } = req.body;

            if (!name) {
                return res.status(400).json({
                    error: "Project name is required",
                });
            }

            const project = await prisma.project.create({
                data: {
                    name,
                    description,
                    tenantId: req.tenantId,
                },
            });

            res.status(201).json({
                message: "Project created successfully",
                project,
            });
        } catch (error) {
            console.error("Error creating project:", error);
            res.status(500).json({
                error: "Internal server error",
            });
        }
    }
);

export default router;