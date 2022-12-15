const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const recordModel = require("./record");
const merchantRecord = require("./merchants");

require("dotenv").config();

mongoose.connect(
  "mongodb://mongo:3olIA8MjCJ6wXeDNMpqw@containers-us-west-171.railway.app:6101",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/ussd", async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = "";

  if (text !== "") {
    response = `CON Checking for existing merchant`;
    const existingMerchant = await merchantRecord.find({
      merchantID: text,
    });
    if (existingMerchant) {
      const newRecord = await new recordModel({
        sessionId,
        serviceCode,
        phoneNumber,
        text,
      });
      response = `CON Saving request`;
      await newRecord.save();
      response = `END Completed`;
    } else {
      response = `END Merchant was not found!!`;
    }
  } else {
    response = `END You didn't provide any input`;
  }

  res.set("Content-Type: text/plain");
  res.send(response);
});

app.get("/", (req, res) => {
  res.json({
    message: "Entry point",
  });
});

const port = process.env.PORT;

app.listen(port, async () => {
  console.log("App started");
});
