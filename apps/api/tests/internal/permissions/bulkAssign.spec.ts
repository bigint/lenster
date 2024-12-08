import { faker } from "@faker-js/faker";
import { TEST_LENS_ID } from "@hey/data/constants";
import { PermissionId } from "@hey/data/permissions";
import prisma from "@hey/db/prisma/db/client";
import axios from "axios";
import { TEST_URL } from "tests/helpers/constants";
import getTestAuthHeaders from "tests/helpers/getTestAuthHeaders";
import { describe, expect, test } from "vitest";

describe("POST /internal/permissions/bulkAssign", () => {
  const testAccountIds = [
    faker.finance.ethereumAddress(),
    faker.finance.ethereumAddress(),
    faker.finance.ethereumAddress()
  ];

  test("should return 200 and bulk assign permissions", async () => {
    const { data, status } = await axios.post(
      `${TEST_URL}/internal/permissions/bulkAssign`,
      { id: PermissionId.Beta, ids: JSON.stringify(testAccountIds) },
      { headers: getTestAuthHeaders() }
    );

    expect(status).toBe(200);
    expect(data.assigned).toBe(testAccountIds.length);

    const accountPermissions = await prisma.accountPermission.findMany({
      where: {
        permissionId: PermissionId.Beta,
        accountAddress: { in: testAccountIds }
      }
    });

    expect(accountPermissions.length).toBe(testAccountIds.length);
  });

  test("should return 200 and skip already assigned permissions", async () => {
    const { data, status } = await axios.post(
      `${TEST_URL}/internal/permissions/bulkAssign`,
      { id: PermissionId.Verified, ids: JSON.stringify([TEST_LENS_ID]) },
      { headers: getTestAuthHeaders() }
    );

    expect(status).toBe(200);
    expect(data.assigned).toBe(0);
  });

  test("should return 400 if body is missing", async () => {
    try {
      await axios.post(
        `${TEST_URL}/internal/permissions/bulkAssign`,
        {},
        { headers: getTestAuthHeaders() }
      );
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  test("should return 401 if the user is not staff", async () => {
    try {
      await axios.post(
        `${TEST_URL}/internal/permissions/bulkAssign`,
        { id: PermissionId.Beta, ids: JSON.stringify(testAccountIds) },
        { headers: getTestAuthHeaders("suspended") }
      );
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });

  test("should return 401 if the id token is missing", async () => {
    try {
      await axios.post(`${TEST_URL}/internal/permissions/bulkAssign`);
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
});
