import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, requirePermission } from "@/lib/auth/session";

const schema = z.object({
  fields: z.record(z.string(), z.string().max(12000)),
});

export async function POST(request: NextRequest) {
  try {
    await requirePermission(request, "content:write", { csrf: true });
    const input = schema.parse(await request.json());
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OPENAI_API_KEY no está configurada." }, { status: 503 });
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_TRANSLATION_MODEL || "gpt-5-mini",
        input: [
          {
            role: "system",
            content:
              "Traduce del español al inglés jurídico corporativo natural. Conserva nombres propios, URLs y estructura. Devuelve solamente un objeto JSON con exactamente las mismas claves.",
          },
          { role: "user", content: JSON.stringify(input.fields) },
        ],
        text: { format: { type: "json_object" } },
      }),
    });
    if (!response.ok) return NextResponse.json({ error: "El servicio de traducción no respondió correctamente." }, { status: 502 });
    const payload = await response.json();
    const output = payload.output_text || payload.output?.flatMap((item: { content?: { text?: string }[] }) => item.content ?? []).map((item: { text?: string }) => item.text).join("");
    return NextResponse.json({ fields: JSON.parse(output) });
  } catch (error) {
    return apiError(error);
  }
}
