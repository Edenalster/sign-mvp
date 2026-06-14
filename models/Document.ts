import mongoose, { Schema, model, models } from "mongoose";

const DocumentSchema = new Schema(
  {
    envelopeId: {
      type: String,
      required: false,
    },

    title: {
      type: String,
      required: true,
    },

    pdfUrl: {
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

export const Document = models.Document || model("Document", DocumentSchema);
