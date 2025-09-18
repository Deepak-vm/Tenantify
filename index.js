import dotenv from "dotenv"
import express, { urlencoded } from "express"
import { prisma } from "./src/db/db.js"
import tenantRoutes from './src/routes/tenantRoutes.js'
import authRoutes from './src/routes/authRoutes.js'
import projectRoutes from './src/routes/projectRoutes.js' 
import userRoutes from './src/routes/userRoutes.js' 

const PORT = process.env.PORT || 4000

dotenv.config()
const app = express()

app.use(express.json())
app.use(urlencoded({ extended: true }))

//Routes
app.use('/tenants', tenantRoutes)
app.use('/auth', authRoutes)
app.use('/api/projects', projectRoutes) 
app.use('/api/users', userRoutes) 

app.get('/health', async (req, res) => {
    try {
        await prisma.$connect();
        res.json({ status: "Database connected" })
    } catch (error) {
        res.status(500).json({ error: "Database connection error" })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})