import { hash } from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { SignUpSchema } from "@/lib/validation";

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = SignUpSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Check the submitted details." }, { status: 400 });
  }

  const { fullName, email, universityId, password, role } = parsed.data;

  try {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, email), eq(users.universityId, universityId)))
      .limit(1);

    if (existingUser) {
      return Response.json({ error: "An account already exists for those details." }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);
    await db.insert(users).values({
      fullName,
      email,
      universityId,
      passwordHash,
      role,
      status: "pending",
    });

    return Response.json({ message: "Account created." }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return Response.json({ error: "An account already exists for those details." }, { status: 409 });
    }
    console.error("Registration failed:", error);
    return Response.json({ error: "Unable to create your account right now." }, { status: 500 });
  }
}