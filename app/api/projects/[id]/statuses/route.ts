import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    console.log("Fetching statuses for project ID:", id);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all columns for the project with their statuses, ordered by column order
    const columns = await prisma.column.findMany({
      where: {
        projectId: id
      },
      include: {
        status: true
      },
    });

    // Extract statuses in the same order as their columns
    const statuses = columns.map(column => column.status);


    return NextResponse.json(statuses);
  } catch (error) {
    console.error("Error fetching statuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch statuses" },
      { status: 500 }
    );
  }
}
