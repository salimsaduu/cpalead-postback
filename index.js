const express = require("express");
const app = express();

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://earn-captcha-bot-latest-default-rtdb.firebaseio.com"  // ✅ Correct Firebase Realtime DB URL
});

const db = admin.database();
const firestore = admin.firestore();

app.get("/postback", async (req, res) => {
  try {
    const { subid, payout, transactionId } = req.query;

    if (!subid || !payout || !transactionId) {
      return res.status(400).send("❌ Missing subid, payout or transactionId");
    }

    // Coins conversion logic (1$ = 100 coins)
    const coins = Math.floor(parseFloat(payout) * 100);

    // ---- Realtime Database Update ----
    const userRefRT = db.ref(`users/${subid}/coins`);
    const snapshot = await userRefRT.once("value");
    let currentCoinsRT = snapshot.val() || 0;
    await userRefRT.set(currentCoinsRT + coins);

    // ---- Firestore Update ----
    const userRefFS = firestore.collection("users").doc(subid);
    const userDoc = await userRefFS.get();
    let currentCoinsFS = 0;
    if (userDoc.exists) {
      currentCoinsFS = userDoc.data().coins || 0;
    }
    await userRefFS.set(
      { coins: currentCoinsFS + coins },
      { merge: true }
    );

    console.log(`✅ User ${subid} credited with ${coins} coins (payout: $${payout})`);
    return res.status(200).send(`✅ ${coins} coins added to user ${subid}`);
  } catch (err) {
    console.error("❌ Error in postback:", err);
    return res.status(500).send("Server Error");
  }
});

// Root check
app.get("/", (req, res) => {
  res.send("🚀 CPAlead Postback Server Running");
});

module.exports = app;
