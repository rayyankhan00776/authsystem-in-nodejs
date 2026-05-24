import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // PAth to the media file in the cloud storage
        url: {
            type: String,
            required: true,
        },
        // Public ID assigned by the cloud storage provider (e.g., Cloudinary) for easy retrieval and management
        public_id: {
            type: String,
            required: true,
        },
        // https:cloudinary.com/diqoy7rc4/image/upload/v1700000000/sample.jpg
        // format of the media file (e.g., jpg, png, mp4)
        mediaType: {
            type: String,
            enum: ["image", "video"],
            required: true,
        },
    },
    { timestamps: true }
);

const MediaModel = mongoose.model("Media", mediaSchema);

export default MediaModel;