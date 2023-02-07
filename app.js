const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { fetch } = require("cross-fetch");
const morgan = require("morgan")

const recordModel = require("./record");
const merchantRecord = require("./merchants");

require("dotenv").config();

mongoose.connect(
  "mongodb://mongo:1TVPwfkEBtrUvEdB3tg4@containers-us-west-61.railway.app:7142",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("common"))

app.post("/ussd", async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = "";

  if (text.length > 0 && text.includes("*")) {
    console.log(text);
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
        response = `CON Making request`;
        const getData = await fetch(
          "https://rhonpesa.online/api/v1/pay",
          {
            method: "POST",
            body: JSON.stringify({
              phone: phoneNumber,
              amount: amount,
              merchant_code: merchantCode,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const json = await getData.json();
        response = `CON Finishing up`;
        if (json) {
          response = `END Completed`;
        }
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
  console.log(`App started on http://localhost:${port}`);
});
