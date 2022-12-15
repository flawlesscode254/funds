const { Schema, model } = require("mongoose");

const recordSchema = new Schema(
  {
    sessionId: {
      type: String,
    },
    serviceCode: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const recordModel = model("recordModel", recordSchema);

module.exports = recordModel;
