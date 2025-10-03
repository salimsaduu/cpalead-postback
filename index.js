const express = require("express");
const app = express();

app.get("/postback", async (req, res) => {
  try {
    console.log("👉 Postback received:", req.query);

    const { subid, payout, transactionId } = req.query;

    if (!subid || !payout || !transactionId) {
      return res.status(400).send("❌ Missing subid, payout or transactionId");
    }

    // Sirf test ke liye
    return res.status(200).send(`✅ Postback OK: ${subid} got payout $${payout}, txn ${transactionId}`);
  } catch (err) {
    console.error("❌ Error in postback:", err);
    return res.status(500).send("Server Error");
  }
});

// Root check
app.get("/", (req, res) => {
  res.send("🚀 CPAlead Postback Server Running (Test Mode)");
});

module.exports = app;
