import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { parseJson } from "@/app/api/_lib/validation";
import { SignupSchema } from "@/app/api/_lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await parseJson(request, SignupSchema);
    if (!body.ok) return body.response;
    const { email, password, name } = body.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    const { password: _password, ...userWithoutPassword } = user;
    void _password;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error in signup:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}
