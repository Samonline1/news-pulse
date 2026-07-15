const mongoose = require("mongoose");

// Cluster schema
const clusterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    clusterId: {
      type: String,
      required: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    titleGenerated: {
      type: Boolean,
      default: false,
    },
    titleGeneratedAt: {
      type: Date,
    },
    summary: {
      type: String,
      trim: true,
      default: "",
    },
    summaryStatus: {
      type: String,
      trim: true,
      default: "idle",
    },
    summaryGeneratedAt: {
      type: Date,
    },
    summaryArticleCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastArticleUpdatedAt: {
      type: Date,
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    articleCount: {
      type: Number,
      required: true,
      min: 0,
    },
    articleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    sources: [
      {
        type: String,
        trim: true,
      },
    ],
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "clusters",
    versionKey: false,
  }
);

clusterSchema.index({ startTime: -1 });

module.exports = mongoose.model("Cluster", clusterSchema);
