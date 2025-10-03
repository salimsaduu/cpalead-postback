const express = require("express");
const app = express();

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://earn-captcha-bot-latest-default-rtdb.firebaseio.com/"
});

const db = admin.database();

app.get("/postback", async (req, res) => {
  try {
    console.log("👉 Postback received:", req.query);

    const { subid, payout, transactionId } = req.query;

    if (!subid || !payout || !transactionId) {
      return res.status(400).send("❌ Missing subid, payout or transactionId");
    }

    // payout ko coins me convert karo (agar 1$ = 100 coins hai)
    const coins = Math.floor(parseFloat(payout) * 100);

    // Realtime DB update
    const userRef = db.ref(`users/${subid}/coins`);
    const snapshot = await userRef.once("value");
    let currentCoins = snapshot.val() || 0;
    await userRef.set(currentCoins + coins);

    return res.status(200).send(`✅ ${coins} coins added to ${subid}`);
  } catch (err) {
    console.error("❌ Error in postback:", err);
    return res.status(500).send("Server Error");
  }
});

app.get("/", (req, res) => {
  res.send("🚀 CPAlead Postback Server Running with Firebase");
});

module.exports = app;
