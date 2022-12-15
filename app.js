const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");
const { fetch } = require("cross-fetch");

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

  if (text.length > 0 && text.includes("*")) {
    let brokendown = text.split("*");
    let merchantCode = brokendown[0];
    let amount = brokendown[1];
    response = `CON merchant input`;
    if (merchantCode === "" || amount === "") {
      response = `END You didn't provide any input (Merchant code together with Amount)`;
    }
    if (Number(merchantCode) <= 0) {
      response = `END you need to provide a correct merchant code format`;
    }
    if (Number(amount) <= 0) {
      response = `END you need to provide the correct amount that is not less than or equal to 0`;
    }
    if (Number(merchantCode) > 0 && Number(amount) > 0) {
      response = `CON Looking for existing merchant`;
      const existingMerchant = await merchantRecord.findOne({
        merchantID: merchantCode,
      });
      if (existingMerchant) {
        fetch("https://jsonplaceholder.typicode.com/todos/1")
          .then((response) => response.json())
          .then(() => (response = `END Completed`));
        // fetch("https://rhonebackend-production.up.railway.app/api/v1/pay", {
        //   method: "POST",
        //   body: JSON.stringify({
        //     phone: phoneNumber,
        //     amount: amount,
        //     merchant_code: merchantCode,
        //   }),
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        // }).then(() => {
        //   response = `END Completed`;
        // });
      } else {
        response = `END Merchant was not found!!`;
      }
    }
  } else {
    response = `END You didn't provide any input (Merchant code together with Amount)`;
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
