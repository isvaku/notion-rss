import mongoose, { Schema, Document, PopulatedDoc } from "mongoose";

export interface IEntry extends Document {
  entryId: string;
  title?: string;
  author?: string;
  content: string;
  link: string;
  created?: boolean;
  entryErrors?: [string];
  entryDate: Date;
}

const EntrySchema: Schema = new Schema(
  {
    entryId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: false },
    content: { type: String, required: true },
    link: { type: String, required: true },
    created: { type: Boolean, default: false },
    entryDate: { type: Date },
    entryErrors: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

EntrySchema.index({ entryId: 1 }, { unique: true });

const Entry = mongoose.model<IEntry>("Entry", EntrySchema);

Entry.createIndexes();

export default Entry;
