import { expect, test } from "@playwright/test";

test.describe("Carrito y checkout", () => {
  test("agregar un producto muestra el conteo correcto en el carrito", async ({ page }) => {
    await page.goto("/product/hoodie-essential");
    await page.getByRole("button", { name: /negro/i }).first().click();
    await page.getByRole("button", { name: "S" }).click();
    await page.getByRole("button", { name: "Añadir al carrito" }).click();

    await expect(page.getByText("Agregado al carrito")).toBeVisible();
    await expect(page.getByLabel("Abrir carrito")).toContainText("1");
  });

  test("el checkout completo con el proveedor sandbox confirma el pedido", async ({ page }) => {
    await page.goto("/product/jogger-essential");
    await page.getByRole("button", { name: "XS" }).click();
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await page.getByRole("link", { name: /ir a pagar/i }).click();

    await expect(page).toHaveURL("/checkout");
    await page.getByLabel("Correo").fill("invitado@example.com");
    await page.getByLabel("Teléfono").fill("+573001112233");
    await page.getByLabel("Nombre").fill("Cliente");
    await page.getByLabel("Apellido").fill("De Prueba");
    await page.getByLabel("Dirección").fill("Calle 1 # 2-3");
    await page.getByLabel("Ciudad").fill("Bogotá");
    await page.getByText("Selecciona").click();
    await page.getByRole("option", { name: "Bogotá D.C." }).click();

    await page.getByRole("button", { name: "Pagar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout\/success/);
    await expect(page.getByText(/gracias por tu compra/i)).toBeVisible();
  });

  test("no permite comprar más unidades que el stock disponible", async ({ page }) => {
    // Chaqueta Puffer Featherlight / Azul Marino has low seeded stock — the
    // quantity stepper must stop at the variant's available count.
    await page.goto("/product/chaqueta-puffer-featherlight");
    await page.getByRole("button", { name: /azul marino/i }).click();
    const plusButton = page.getByLabel("Aumentar cantidad");
    for (let i = 0; i < 25; i++) {
      if (await plusButton.isDisabled()) break;
      await plusButton.click();
    }
    await expect(plusButton).toBeDisabled();
  });
});
