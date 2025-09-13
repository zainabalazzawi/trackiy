import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all statuses from projects where user is a member or creator
    const statuses = await prisma.status.findMany({
      where: {
        project: {
          OR: [
            // Projects created by the user
            { userId: session.user.id },
            // Projects where the user is a member
            {
              members: {
                some: {
                  userId: session.user.id
                }
              }
            }
          ]
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });

    return NextResponse.json(statuses);
  } catch (error) {
    console.error("Error fetching all statuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch statuses" },
      { status: 500 }
    );
  }
}

