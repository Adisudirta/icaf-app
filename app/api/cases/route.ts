import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";
import { z } from "zod";

const schema = z.object({
  caseNumber: z.string().min(1),
  incidentDate: z.string().min(1),
  investigatingOfficer: z.string().min(1),
  incidentLocation: z.string().min(1),
  incidentType: z.string().min(1),
  threatLevel: z.string().min(1),
  victimAction: z.string().min(1),
  suspectCondition: z.string().min(1),
  victimCondition: z.string().min(1),
  context: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const caseId = crypto.randomUUID();
  await db.insert(cases).values({
    id: caseId,
    userId: session.user.id,
    ...parsed.data,
  });

  return Response.json({ caseId });
}
