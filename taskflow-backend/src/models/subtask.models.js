import mongoose, { Schema } from "mongoose";

const subTaskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    isCompleted: { type: Boolean, default: false },
    attachments: {
      type: [{ url: String, mimetype: String, size: Number }],
      default: [],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const SubTask = mongoose.model("SubTask", subTaskSchema);
