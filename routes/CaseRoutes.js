import express from "express";
import CasePrice from "../models/casePrice.js";
import cron from "node-cron";

const router = express.Router();
const caseNames = [
  "Prisma 2 Case",
  "Prisma Case",
  "CS20 Case",
  "Revolver Case",
  "Gamma Case",
  "Shadow Case",
  "Operation Riptide Case",
  "Operation Wildfire Case",
  "Recoil Case",
  "Fracture Case"
];

// Enregistrer ou mettre à jour le prix d'achat d'une caisse avec une date
router.post("/purchase", async (req, res) => {
  const { caseName, purchasePrice, purchaseDate } = req.body;
  if (!caseName || purchasePrice == null || !purchaseDate) {
    return res.status(400).json({ error: "Nom de la caisse, prix d'achat et date requis" });
  }

  try {
    // 1) On parse la date telle qu'elle est envoyée, sans forcer setHours(0,0,0,0)
    const parsedDate = new Date(purchaseDate);

    // 2) On utilise cette date telle quelle dans la requête
    const updatedEntry = await CasePrice.findOneAndUpdate(
      { name: caseName, date: parsedDate },
      { purchasePrice: purchasePrice },
      { new: true, upsert: true }
    );

    res.json({
      message: `Prix d'achat enregistré pour ${caseName} à la date ${parsedDate.toISOString()}: ${purchasePrice}€`
    });
  } catch (error) {
    res.status(500).json({
      error: "Erreur lors de l'enregistrement du prix d'achat",
      details: error.message
    });
  }
});

// Récupérer l'historique des prix de toutes les caisses
router.get("/history", async (req, res) => {
  try {
    const history = await CasePrice.find().sort({ date: 1 }).exec();
    if (!history || history.length === 0) {
      return res.status(404).json({ error: "Aucun historique trouvé pour les caisses" });
    }
    res.json(history);
  } catch (error) {
    res.status(500).json({
      error: "Erreur lors de la récupération de l'historique",
      details: error.message
    });
  }
});

// Automatiser la récupération des prix toutes les heures
cron.schedule("*/10 * * * *", async () => {
  console.log("⏳ Mise à jour automatique des prix toutes les 10 minutes");

  for (const caseName of caseNames) {
    const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=3&market_hash_name=${encodeURIComponent(caseName)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("🚀 ~ cron.schedule ~ data:", data);
      
      if (data.success) {
        let price = data.median_price
          ? parseFloat(data.median_price.replace("€", "").replace(",", "."))
          : null;
        if (price !== null) {
          // On enregistre la date/heure actuelle
          const now = new Date();
          now.setSeconds(0, 0); // ✅ Supprime les millisecondes pour une meilleure précision
          await CasePrice.create({ name: caseName, price, date: now });
          console.log(`✅ Prix enregistré pour ${caseName} : ${price}€`);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur mise à jour pour ${caseName}:`, error.message);
    }
  }
});

export default router;