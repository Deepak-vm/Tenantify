import { prisma } from "../db/db.js";
import {comparePassword} from "../utils/auth.js";
import { createToken } from "../utils/jwt.js";

export const loginUser = async(req , res)=>{
    try {
        const { email , password, domain} = req.body;
        if(!email || !password || !domain){
            return res.status(400).json({
                message: "Email, password, and domain are required"
            })
        }

        // First find the tenant by domain
        const tenant = await prisma.tenant.findUnique({
            where: { domain: domain }
        });

        if(!tenant) {
            return res.status(401).json({
                message: "Invalid tenant domain"
            })
        }

        // Then find user by email and tenantId
        const user = await prisma.user.findUnique({
            where: {
                email_tenantId: {
                    email: email,
                    tenantId: tenant.id
                }
            },
            include: { tenant: true }
        });

        if(!user){
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }
        
        const isPasswordValid = await comparePassword(password , user.password);
        if(!isPasswordValid){
            return res.status(401).json({
                message:"Invalid credentials"
            })
        }
        
        const tokenPayload = {
            userId : user.id,
            tenantId:user.tenantId,
            role: user.role,
            email: user.email
        };
        const token = createToken(tokenPayload);
        const {password:_ , ...userData} = user;
        res.json({
            message: "Login successful",
            token , 
            user:userData,
        })
    

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: "Internal server error"
        })
        
    }
}