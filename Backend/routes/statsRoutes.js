import express from "express";
import statsModule
from "../modules/statsModule.js";

const router = express.Router();

// Dashboard stats
router.get("/", statsModule.getDashboardStats);

export default router;