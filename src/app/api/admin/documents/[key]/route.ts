import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "@/lib/auth/audit";
import { apiError, requirePermission } from "@/lib/auth/session";
import { getCmsDocument, saveDocumentDraft } from "@/lib/cms/repository";
import { validateSiteConfigLinks } from "@/lib/cms/links";

export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    await requirePermission(request, "content:read");
    const { key } = await params;
    const document = await getCmsDocument(key, "draft");
    if (!document) return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
    return NextResponse.json({ document });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const context = await requirePermission(request, "content:write", { csrf: true });
    const { key } = await params;
    const input = z.object({ data: z.record(z.string(), z.unknown()) }).parse(await request.json());
    if (key === "site-config") {
      const linkErrors = validateSiteConfigLinks(input.data);
      if (linkErrors.length) {
        return NextResponse.json({ error: linkErrors[0], details: linkErrors }, { status: 400 });
      }
    }
    const document = await saveDocumentDraft(key, input.data, context.user.id);
    await writeAudit(request, {
      userId: context.user.id,
      action: "content.draft_saved",
      resource: "cms_document",
      resourceId: document.id,
      metadata: { key },
    });
    return NextResponse.json({ document });
  } catch (error) {
    return apiError(error);
  }
}
