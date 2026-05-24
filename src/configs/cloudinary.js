import cloudinary from "cloudinary";
import config from "./config.js";

const cloudinaryV2 = cloudinary.v2;

// CLOUDINARY_URL is the simplest supported config.
// Example: cloudinary://<api_key>:<api_secret>@<cloud_name>
if (config.MODE !== "test" && process.env.NODE_ENV !== "test") {
    const hasCloudinaryUrl = Boolean(process.env.CLOUDINARY_URL);
    if (!hasCloudinaryUrl) {
        console.warn("CLOUDINARY_URL is not defined in the environment variables");
    }
}

cloudinaryV2.config({
    secure: true,
});

export function uploadBuffer(buffer, options = {}) {
    return new Promise((resxolve, reject) => {
        const stream = cloudinaryV2.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            return resolve(result);
        });

        stream.end(buffer);
    });
}

export async function uploadFromUrl(url, options = {}) {
    return cloudinaryV2.uploader.upload(url, options);
}

export async function destroyAsset(publicId, resourceType = "image") {
    return cloudinaryV2.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinaryV2;
