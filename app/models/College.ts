import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICollege extends Document {
    name: string;
    createdAt: Date;
}

const CollegeSchema = new Schema<ICollege>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
    },
    { timestamps: true }
);

// Text index for fast search
CollegeSchema.index({ name: "text" });
// Regular index for regex search
CollegeSchema.index({ name: 1 });

const College: Model<ICollege> =
    mongoose.models.College || mongoose.model<ICollege>("College", CollegeSchema);

export default College;
