import { test, expect } from "@playwright/test";

test("real API simulation, graphs, comparison and mature baseline", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.locator(".status")).toContainText("Run complete");
  await expect(page.locator(".js-plotly-plot")).toBeVisible();
  await expect(page.locator(".metric").first()).toContainText("3.980");
  await page.getByRole("button", { name: "Pin for comparison" }).click();
  await page.getByRole("combobox", { name: /^Scenario/ }).selectOption("mature");
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.locator(".metric").first()).toContainText("0.000");
  await expect(page.locator(".compare")).toContainText("Pinned: engineered");
  await page.getByRole("tab", { name: "Tissue", exact: true }).click();
  await expect(page.locator(".js-plotly-plot")).toBeVisible();
});

test("API failure is actionable and preserves previous results", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.locator(".status")).toContainText("Run complete");
  await page.route("**/simulations", route => route.abort());
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.locator(".error[role=alert]")).toContainText("Could not reach the simulation API");
  await expect(page.locator(".metric").first()).toContainText("3.980");
  await expect(page.getByRole("button", { name: "Run simulation" })).toBeEnabled();
});

test("validation failure, sweeps and downloadable reproducibility", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Duration · model time").fill("0");
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.locator(".error[role=alert]")).toContainText("Simulation rejected (422)");
  await page.getByRole("button", { name: "Reset setup" }).click();
  await page.getByRole("button", { name: "Run sweep" }).click();
  await expect(page.getByRole("button", { name: "Export sweep JSON" })).toBeVisible();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save config" }).click();
  expect((await pending).suggestedFilename()).toBe("osteogenesis-config.json");
});

test("mobile layout fits viewport and exposes controls", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await expect(page.getByRole("heading", { name: "Simulation setup" })).toBeVisible();
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.locator(".status")).toContainText("Run complete");
  await expect(page.locator(".js-plotly-plot")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});

test("desktop research workspace screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.locator(".js-plotly-plot")).toBeVisible();
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
});
