import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { writeAudit } from "@/lib/auth/audit";
import { apiError, requirePermission } from "@/lib/auth/session";
import { publishDocument } from "@/lib/cms/repository";

export async function POST(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const context = await requirePermission(request, "content:publish", { csrf: true });
    const { key } = await params;
    const document = await publishDocument(key, context.user.id);
    revalidatePath("/", "layout");
    await writeAudit(request, {
      userId: context.user.id,
      action: "content.published",
      resource: "cms_document",
      resourceId: document.id,
      metadata: { key, version: document.version },
    });
    return NextResponse.json({ document });
  } catch (error) {
    return apiError(error);
  }
}
