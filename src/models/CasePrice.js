import mongoose from "mongoose";

const CasePriceSchema = new mongoose.Schema({
  name: String,
  price: Number,
  purchasePrice: { type: Number, default: null },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("CasePrice", CasePriceSchema);