import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "@/lib/auth/audit";
import { apiError, requirePermission } from "@/lib/auth/session";
import { listDocumentVersions, restoreDocumentVersion } from "@/lib/cms/repository";

export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    await requirePermission(request, "content:read");
    const { key } = await params;
    return NextResponse.json({ versions: await listDocumentVersions(key) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const context = await requirePermission(request, "content:publish", { csrf: true });
    const { key } = await params;
    const input = z.object({ versionId: z.string().uuid() }).parse(await request.json());
    const document = await restoreDocumentVersion(key, input.versionId, context.user.id);
    await writeAudit(request, {
      userId: context.user.id,
      action: "content.version_restored",
      resource: "cms_document",
      resourceId: document.id,
      metadata: { key, versionId: input.versionId },
    });
    return NextResponse.json({ document });
  } catch (error) {
    return apiError(error);
  }
}
