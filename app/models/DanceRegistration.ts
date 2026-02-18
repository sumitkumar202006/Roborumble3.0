import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDanceRegistration extends Document {
    profileId: mongoose.Types.ObjectId;
    category: "Solo" | "Group";
    danceStyle: string;
    performanceTime: string;
    teamName?: string;
    members?: string[]; // Names of team members (for Group) or just the individual's name (for Solo)
    videoLink?: string;
    status: "pending" | "verified" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}

const DanceRegistrationSchema = new Schema<IDanceRegistration>(
    {
        profileId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        category: {
            type: String,
            enum: ["Solo", "Group"],
            required: true,
        },
        danceStyle: {
            type: String,
            required: true,
        },
        performanceTime: {
            type: String,
            default: "4–5 minutes",
        },
        teamName: {
            type: String,
            required: function(this: IDanceRegistration) {
                return this.category === "Group";
            }
        },
        members: [
            {
                type: String,
            }
        ],
        videoLink: String,
        status: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Strategic indexes
DanceRegistrationSchema.index({ profileId: 1 });
DanceRegistrationSchema.index({ category: 1 });

const DanceRegistration: Model<IDanceRegistration> =
    mongoose.models.DanceRegistration ||
    mongoose.model<IDanceRegistration>("DanceRegistration", DanceRegistrationSchema);

export default DanceRegistration;
