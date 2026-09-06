import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  configured = true;
}

const UPLOAD_FOLDER = "basti-motos/products";

/**
 * Genera los parámetros firmados que el panel admin necesita para subir una
 * imagen directamente desde el navegador a Cloudinary, sin exponer el
 * api_secret. El admin sube el archivo a la URL de Cloudinary usando estos
 * parámetros; Cloudinary valida la firma antes de aceptar el archivo.
 */
export function createSignedUploadParams() {
  ensureConfigured();

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    throw new Error("CLOUDINARY_API_SECRET no está configurado.");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { folder: UPLOAD_FOLDER, timestamp };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    timestamp,
    folder: UPLOAD_FOLDER,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

export async function deleteCloudinaryImage(publicId: string) {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}
