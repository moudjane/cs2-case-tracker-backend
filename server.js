import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import caseRoutes from "./src/routes/CaseRoutes.js";

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use("/api", caseRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));