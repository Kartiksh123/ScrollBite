const ImageKit = require("@imagekit/nodejs");

async function uploadFile(file, fileName) {
    try {
        if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
            throw new Error("ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT to upload videos.");
        }

        const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        });

        console.log("ImageKit configuration:", {
            publicKeyPresent: !!process.env.IMAGEKIT_PUBLIC_KEY,
            privateKeyPresent: !!process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpointPresent: !!process.env.IMAGEKIT_URL_ENDPOINT
        });

        console.log("Uploading file:", fileName);
        console.log("File size:", file.length, "bytes");

        const result = await imagekit.files.upload({
            file: file.toString("base64"),
            fileName: fileName
        });

        console.log("ImageKit upload successful:", result.url);

        return result;

    } catch (error) {
        console.error("ImageKit upload failed:", error);
        throw error;
    }
}

module.exports = { uploadFile };
