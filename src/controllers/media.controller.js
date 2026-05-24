import MediaModel from "../models/media.model.js";
import config from "../configs/config.js";
import { destroyAsset, uploadBuffer, uploadFromUrl } from "../configs/cloudinary.js";

const CLOUDINARY_BASE_FOLDER = "Home/Gallery-app";

function isTestMode() {
    return config.MODE === "test" || process.env.NODE_ENV === "test";
}

export async function postMedia(req, res) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const media = new MediaModel();
        const mediaId = media._id.toString();
        const folder = `${CLOUDINARY_BASE_FOLDER}/${userId}`;

        const inputUrl = req.body?.url;
        const fileBuffer = req.file?.buffer;

        if (!fileBuffer && !inputUrl) {
            return res.status(400).json({ message: "file (multipart) or url (string) is required" });
        }

        // In tests, avoid calling external Cloudinary and just store provided URL.
        if (isTestMode()) {
            media.user = userId;
            media.url = inputUrl || "https://example.com/test-media";
            media.public_id = `${folder}/${mediaId}`;
            media.mediaType = req.body?.mediaType || "image";
            await media.save();

            return res.status(201).json({
                message: "Media created successfully",
                media,
            });
        }

        const uploadOptions = {
            folder,
            public_id: mediaId,
            resource_type: "auto",
            overwrite: false,
        };

        const uploadResult = fileBuffer
            ? await uploadBuffer(fileBuffer, uploadOptions)
            : await uploadFromUrl(inputUrl, uploadOptions);

        if (!uploadResult?.public_id || !uploadResult?.secure_url) {
            return res.status(500).json({ message: "Failed to upload media" });
        }

        if (uploadResult.resource_type !== "image" && uploadResult.resource_type !== "video") {
            try {
                await destroyAsset(uploadResult.public_id, uploadResult.resource_type);
            } catch {
                // ignore cleanup errors
            }

            return res.status(400).json({ message: "Only image and video files are supported" });
        }

        media.user = userId;
        media.url = uploadResult.secure_url;
        media.public_id = uploadResult.public_id;
        media.mediaType = uploadResult.resource_type;
        await media.save();

        return res.status(201).json({
            message: "Media created successfully",
            media,
        });
    } catch (error) {
        console.error("Error in postMedia controller:", error);

        if (error?.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMedia(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const media = await MediaModel.findOne({ _id: id, user: userId });

        if (!media) {
            return res.status(404).json({ message: "Media not found" });
        }

        return res.status(200).json({
            message: "Media found successfully",
            media,
        });
    } catch (error) {
        console.error("Error in getMedia controller:", error);

        if (error?.name === "CastError") {
            return res.status(400).json({ message: "Invalid media id" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getAllMedia(req, res) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const media = await MediaModel.find({ user: userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Media fetched successfully",
            count: media.length,
            media,
        });
    } catch (error) {
        console.error("Error in getAllMedia controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteMedia(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const media = await MediaModel.findOne({ _id: id, user: userId });

        if (!media) {
            return res.status(404).json({ message: "Media not found" });
        }

        if (!isTestMode()) {
            try {
                await destroyAsset(media.public_id, media.mediaType);
            } catch (error) {
                console.error("Error deleting media from Cloudinary:", error);
            }
        }

        await media.deleteOne();

        return res.status(200).json({
            message: "Media deleted successfully",
            media,
        });
    } catch (error) {
        console.error("Error in deleteMedia controller:", error);

        if (error?.name === "CastError") {
            return res.status(400).json({ message: "Invalid media id" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteAllMedia(req, res) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const media = await MediaModel.find({ user: userId });

        if (!isTestMode()) {
            await Promise.allSettled(
                media.map((m) => destroyAsset(m.public_id, m.mediaType))
            );
        }

        const result = await MediaModel.deleteMany({ user: userId });

        return res.status(200).json({
            message: "All media deleted successfully",
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Error in deleteAllMedia controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default { postMedia, getMedia, getAllMedia, deleteMedia, deleteAllMedia };
