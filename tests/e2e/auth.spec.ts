import { expect, test } from "@playwright/test";

test.describe("Autenticación", () => {
  test("un visitante puede iniciar sesión con las credenciales de prueba del seed", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo").fill("camila@example.com");
    await page.getByLabel("Contraseña").fill("Novawear123");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page).toHaveURL("/");
    await page.goto("/account");
    await expect(page.getByText("camila@example.com")).toBeVisible();
  });

  test("rechaza credenciales incorrectas con un mensaje de error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo").fill("camila@example.com");
    await page.getByLabel("Contraseña").fill("wrong-password");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page.getByText(/correo o contraseña incorrectos/i)).toBeVisible();
  });

  test("un cliente no puede acceder al panel administrativo", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo").fill("camila@example.com");
    await page.getByLabel("Contraseña").fill("Novawear123");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin$/);
  });
});
