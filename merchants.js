const { Schema, model } = require("mongoose");

const merchantSchema = new Schema(
  {
    merchantID: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const merchantModel = model("merchantModel", merchantSchema);

module.exports = merchantModel;
