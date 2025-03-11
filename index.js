const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VERIFICATION_SID } = process.env;

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/api/", (req, res) => {
  res.send("Hello World");
});

app.post("/api/verify-code", async (req, res) => {
  try {
    const { code, sid } = req.body;
    const verificationCheck = await client.verify.v2
      .services(VERIFICATION_SID)
      .verificationChecks.create({
        code,
        verificationSid: sid,
      });
    return res.status(200).send(verificationCheck.status);
  } catch (e) {
    return res.status(500).send("Internal server error");
  }
});

app.post("/api/create-verification-code", async (req, res) => {
  try {
    const { phone, channel } = req.body;

    if (!["sms", "call"].includes(channel)) {
      return res.status(400).send("Invalid channel");
    }
    const verification = await client.verify.v2
      .services(VERIFICATION_SID)
      .verifications.create({
        channel,
        to: phone,
      });
    return res.status(200).send({
      message: "Verification code sent",
      sid: verification.sid,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal server error");
  }
});

app.listen(3000 || process.env.port, () => {
  console.log("Server is running on port 3000");
});
