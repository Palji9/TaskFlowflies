import mongoose, { Schema } from "mongoose";

const workspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    image_url: {
      type: String,
      default: "https://placehold.co/200x200?text=WS",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name before save
workspaceSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug =
      this.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
      "-" +
      Date.now().toString(36);
  }
  next();
});

export const Workspace = mongoose.model("Workspace", workspaceSchema);
