const mongoose = require("mongoose");

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
