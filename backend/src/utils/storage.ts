import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function handleUpload(file: any, userId: string) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "image",
    folder: `receipts/user_${userId}`, // Create user-specific folder
    use_filename: true,
    unique_filename: true,
  });
  return res;
}
