import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSignedUploadParams } from "@/lib/cloudinary";

/** Solo el admin puede pedir una firma de subida (protege el panel de productos). */
export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const params = createSignedUploadParams();
    return NextResponse.json(params);
  } catch (error) {
    console.error("[cloudinary] Error generando firma:", error);
    return NextResponse.json(
      { error: "Cloudinary no está configurado. Define las variables CLOUDINARY_* en .env" },
      { status: 500 }
    );
  }
}
