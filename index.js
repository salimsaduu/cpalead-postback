const express = require("express");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;

// Firebase init
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com"
});
const db = admin.firestore();

// CPAlead Postback endpoint
app.get("/postback", async (req, res) => {
  const { subid, amount } = req.query;

  if (!subid || !amount) {
    return res.status(400).send("Missing subid or amount");
  }

  try {
    await db.collection("users").doc(subid).update({
      coins: admin.firestore.FieldValue.increment(parseInt(amount))
    });

    return res.send("Coins added");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error updating coins");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
