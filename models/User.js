import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // 5-digit login PIN. pinKey = HMAC of the PIN (unique -> PIN alone identifies
    // the user), pinHash = bcrypt copy.
    pinKey: { type: String, unique: true, sparse: true },
    pinHash: { type: String },
    role: {
      type: String,
      enum: ["superadmin", "admin", "teacher"],
      required: true,
      default: "teacher",
    },
    // A short, unique, human-facing staff ID (e.g. "T-0007"), separate from
    // the Mongo _id, used on ID cards / attendance sheets / exports.
    teacherId: { type: String, unique: true, sparse: true, trim: true },
    phone: { type: String },

    // Class-Teacher designation: at most one class this person is the class
    // teacher for.
    classTeacherOf: { type: String, default: null },


    assignedClasses: [{ type: String }],

    photoUrl: { type: String },

    // Face Recognition data capture — we store a captured reference image
    // and an opaque descriptor payload (produced client-side) used to match
    // the teacher during face-based check-in/check-out.
    faceCaptured: { type: Boolean, default: false },
    faceImageUrl: { type: String },
    faceDescriptor: { type: [Number], default: undefined },

    active: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }, // soft-delete marker
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
