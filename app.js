const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const recordModel = require("./record");

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
  // Read the variables sent via POST from our API
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  const newRecord = await new recordModel({
    sessionId,
    serviceCode,
    phoneNumber,
    text,
  });
  await newRecord.save().then(() => {
    res.set("Content-Type: text/plain");
    res.send("Completed");
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Entry point",
  });
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log("App started");
});
