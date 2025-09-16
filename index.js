import dotenv from "dotenv"
import express, { urlencoded } from "express"
import {prisma} from "./src/db/db.js"
import tenantRoutes from './src/routes/tenantRoutes.js'
const PORT = process.env.PORT || 4001


dotenv.config()
const app = express()

app.use(express.json())
app.use(urlencoded({extended:true}))

//Routes
app.use('/tenants' , tenantRoutes)

app.get('/health' , async(req , res)=>{
    try {
        await prisma.$connect();
        res.json({status: "Database connected"})
    } catch (error) {
        res.status(500).json({error: "Database connection error"})

    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})