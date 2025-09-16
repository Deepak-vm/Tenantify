import { createTenant } from "../controllers/tenantController.js";
import express from 'express';
const router = express.Router(); 

router.post('/' , createTenant);

export default router;