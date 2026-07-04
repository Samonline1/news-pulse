const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },
    summary: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      trim: true,
      default: "",
    },
    published: {
      type: String,
      trim: true,
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    clusterId: {
      type: String,
      index: true,
      default: "",
    },
  },
  {
    collection: "articles",
    versionKey: false,
  }
);

module.exports = mongoose.model("Article", articleSchema);
