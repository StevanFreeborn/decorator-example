import {
  APIRequestContext,
  test as base,
  expect,
  request,
} from "@playwright/test";
import { APIRequestContextDecorator } from "../apiRequestContextDecorator";

type Fixtures = {
  request: APIRequestContext;
};

const test = base.extend<Fixtures>({
  request: async ({}, use) => {
    const newRequestContext = await request.newContext({
      baseURL: "https://restapiplayground.stevanfreeborn.com",
    });

    const decoratedContext = new APIRequestContextDecorator(newRequestContext);

    decoratedContext.onResponse((response) => {
      const headers = response.headers();
      const cacheControlHeader = headers["cache-control"];
      const pragmaHeader = headers["pragma"];

      expect(cacheControlHeader).toContain("no-store");
      expect(cacheControlHeader).toContain("no-cache");
      expect(pragmaHeader).toBe("no-cache");
    });

    await use(decoratedContext);

    decoratedContext.dispose();
  },
});

test("it should return 401 status code without proper authorization", async ({
  request,
}) => {
  const response = await request.get("users");

  expect(response.status()).toBe(401);
});

test("it should return 200 status code with proper authorization", async ({
  request,
}) => {
  const response = await request.get("users", {
    headers: {
      Authorization: `Basic ${Buffer.from(`admin:password`).toString("base64")}`,
    },
  });

  expect(response.status()).toBe(200);
});
