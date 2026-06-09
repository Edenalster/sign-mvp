import mongoose, { Schema, model, models } from "mongoose";

const SignatureFieldSchema = new Schema(
  {
    documentId: {
      type: String,
      required: true,
    },

    page: {
      type: Number,
      required: true,
    },

    xPercent: {
      type: Number,
      required: true,
    },

    yPercent: {
      type: Number,
      required: true,
    },

    signedImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const SignatureField =
  models.SignatureField || model("SignatureField", SignatureFieldSchema);
