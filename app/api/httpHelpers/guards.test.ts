import { describe, expect, it, vi, beforeEach } from "vitest";
import { expectFailure, expectSuccess } from "@/test/helpers";
import type { Session } from "next-auth";
import type { Role } from "@/lib/permissions";

const { getServerSessionMock, findUniqueMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  findUniqueMock: vi.fn(),
}));
vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findUnique: findUniqueMock,
    },
  },
}));

vi.mock("../auth/lib/auth", () => ({
  authOptions: {},
}));

import {
  getProjectRole,
  requireProjectAccess,
  requireProjectPermission,
  requireProjectRole,
  requireSession,
} from "./guards";

const PROJECT_ID = "project-1";
const USER_ID = "user-1";
const OTHER_USER_ID = "user-2";

function makeSession(userId = USER_ID): Session {
  return {
    user: { id: userId, email: "user@example.com" },
    expires: "2099-01-01T00:00:00.000Z",
  };
}

function mockProjectLookup(options: {
  creatorId?: string;
  memberRole?: Role | null;
}) {
  const { creatorId = OTHER_USER_ID, memberRole = null } = options;

  findUniqueMock.mockResolvedValue({
    userId: creatorId,
    members: memberRole ? [{ role: memberRole }] : [],
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  getServerSessionMock.mockResolvedValue(makeSession());
});

describe("requireSession", () => {
  it.each([null, { expires: "2099-01-01" }])(
    "returns 401 when session is %j",
    async (session) => {
      getServerSessionMock.mockResolvedValue(session);

      await expectFailure(await requireSession(), 401, "Unauthorized");
    }
  );

  it("returns the session when authenticated", async () => {
    const session = makeSession();
    getServerSessionMock.mockResolvedValue(session);

    const result = expectSuccess<{ ok: true; session: Session }>(
      await requireSession()
    );
    expect(result.session).toEqual(session);
  });
});

describe("getProjectRole", () => {
  it("returns null when the project does not exist", async () => {
    findUniqueMock.mockResolvedValue(null);

    await expect(getProjectRole(USER_ID, PROJECT_ID)).resolves.toBeNull();
  });

  it("returns OWNER when the user created the project", async () => {
    findUniqueMock.mockResolvedValue({ userId: USER_ID, members: [] });

    await expect(getProjectRole(USER_ID, PROJECT_ID)).resolves.toBe("OWNER");
  });

  it.each(["VIEWER", "MEMBER", "ADMIN"] as const)(
    "returns membership role %s when the user is a member",
    async (role) => {
      mockProjectLookup({ memberRole: role });

      await expect(getProjectRole(USER_ID, PROJECT_ID)).resolves.toBe(role);
    }
  );

  it("returns null when the user is not the creator or a member", async () => {
    mockProjectLookup({ memberRole: null });

    await expect(getProjectRole(USER_ID, PROJECT_ID)).resolves.toBeNull();
  });
});

describe("requireProjectRole", () => {
  it.each([
    [
      "401 unauthenticated",
      () => getServerSessionMock.mockResolvedValue(null),
      "",
      "VIEWER" as Role,
      401,
      "Unauthorized",
    ],
    [
      "400 missing projectId",
      () => {},
      "",
      "VIEWER" as Role,
      400,
      "Missing projectId",
    ],
    [
      "403 no role",
      () => mockProjectLookup({ memberRole: null }),
      PROJECT_ID,
      "VIEWER" as Role,
      403,
      "Forbidden",
    ],
    [
      "403 role too low",
      () => mockProjectLookup({ memberRole: "VIEWER" }),
      PROJECT_ID,
      "MEMBER" as Role,
      403,
      "Forbidden",
    ],
  ])(
    "%s",
    async (_label, setup, projectId, minRole, status, error) => {
      setup();
      await expectFailure(
        await requireProjectRole(projectId, minRole),
        status,
        error
      );
    }
  );

  it("returns the resolved role when access is allowed", async () => {
    mockProjectLookup({ memberRole: "ADMIN" });

    const result = expectSuccess<{ ok: true; session: Session; role: Role }>(
      await requireProjectRole(PROJECT_ID, "MEMBER")
    );
    expect(result.role).toBe("ADMIN");
    expect(result.session.user.id).toBe(USER_ID);
  });
});

describe("requireProjectPermission", () => {
  it("returns 403 when the role lacks the permission", async () => {
    mockProjectLookup({ memberRole: "VIEWER" });

    await expectFailure(
      await requireProjectPermission(PROJECT_ID, "edit_ticket"),
      403,
      "Forbidden"
    );
  });

  it("returns the resolved role when the permission is granted", async () => {
    mockProjectLookup({ memberRole: "MEMBER" });

    const result = expectSuccess<{ ok: true; session: Session; role: Role }>(
      await requireProjectPermission(PROJECT_ID, "edit_ticket")
    );
    expect(result.role).toBe("MEMBER");
  });
});

describe("requireProjectAccess", () => {
  it("allows viewers to access the project", async () => {
    mockProjectLookup({ memberRole: "VIEWER" });

    const result = expectSuccess<{ ok: true; session: Session; role: Role }>(
      await requireProjectAccess(PROJECT_ID)
    );
    expect(result.role).toBe("VIEWER");
  });
});
