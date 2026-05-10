import express from "express";
import { getAiProductSuggestions } from "./aiService.js";

const router = express.Router();

router.get("/recommendations", async (req, res) => {
  try {
    const { productId, userId } = req.query;
    const suggestions = await getAiProductSuggestions(productId, userId, 5);
    res.json(suggestions);
  } catch (err) {
    console.error("Lỗi lấy gợi ý AI:", err.message);
    res.status(500).json({ message: "Không thể lấy gợi ý sản phẩm AI" });
  }
});

export default router;
