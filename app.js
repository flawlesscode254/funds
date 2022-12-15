const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/ussd", (req, res) => {
  // Read the variables sent via POST from our API
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  console.log(sessionId, serviceCode, phoneNumber, text);
});

app.get("/", (req, res) => {
    res.json({
        message: "Entry point"
    })
})

const port = 3213

app.listen(port, () => {
    console.log("App started");
})
