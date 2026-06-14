import mongoose, { Schema, model, models } from "mongoose";

const EnvelopeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "pending", "completed"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

export const Envelope = models.Envelope || model("Envelope", EnvelopeSchema);
