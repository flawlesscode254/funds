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

const getAccessToken = async (req, res, next) => {
  const key = "33LK2IISJhwPoR8RpajMXxdWZWCgA5tu";
  const secret = "M7goD385g6XvfYEW";
  const auth = new Buffer.from(`${key}:${secret}`).toString("base64");

  await axios
    .get(
      ` https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          authorization: `Basic ${auth}`,
        },
      }
    )
    .then((res) => {
      access_token = res.data.access_token;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
};

app.post("/ussd", getAccessToken, async (req, res) => {
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
        response = `CON Initiating push`;
        const date = new Date();
        const timestamp =
          date.getFullYear() +
          ("0" + (date.getMonth() + 1)).slice(-2) +
          ("0" + date.getDate()).slice(-2) +
          ("0" + date.getHours()).slice(-2) +
          ("0" + date.getMinutes()).slice(-2) +
          ("0" + date.getSeconds()).slice(-2);

        await axios
          .post(
            ` https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`,
            {
              BusinessShortCode: 174379,
              Password:
                "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjIxMjE1MTcyODE4",
              Timestamp: timestamp,
              TransactionType: "CustomerPayBillOnline",
              Amount: 1,
              PartyA: 254708374149,
              PartyB: 174379,
              PhoneNumber: 254708374149,
              CallBackURL: "https://mydomain.com/path",
              AccountReference: "CompanyXLTD",
              TransactionDesc: "Payment of X",
            },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          )
          .then((resp) => {
            res.json(resp.data);
            response = `END Completed`;
          })
          .catch((err) => {
            res.json(err);
            response = `END Error occured`;
          });
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
