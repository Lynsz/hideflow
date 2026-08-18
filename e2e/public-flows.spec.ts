import { expect, test } from "@playwright/test";

test("navega da página inicial para o login", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Sua busca por emprego, com menos caos e mais clareza.",
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Bem-vinda de volta" }),
  ).toBeVisible();
});

test("valida o pedido de recuperação antes de enviar", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Esqueci minha senha" }).click();

  await expect(page).toHaveURL(/\/recuperar-senha$/);
  await expect(
    page.getByRole("heading", { name: "Recupere seu acesso" }),
  ).toBeVisible();

  await page.getByLabel("E-mail da conta").fill("email-invalido");
  await page.getByRole("button", { name: "Enviar instruções" }).click();
  await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
});

test("redireciona visitante de rota protegida para o login", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  await expect(
    page.getByRole("heading", { name: "Bem-vinda de volta" }),
  ).toBeVisible();
});

test("protege o download de dados sem sessão", async ({ request }) => {
  const response = await request.get(
    "/dashboard/configuracoes/exportar?format=json",
    { maxRedirects: 0 },
  );

  expect(response.status()).toBe(307);
  expect(response.headers().location).toMatch(
    /\/login\?next=%2Fdashboard%2Fconfiguracoes%2Fexportar%3Fformat%3Djson$/,
  );
});

test("expõe somente o estado mínimo no endpoint de liveness", async ({
  request,
}) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(await response.json()).toEqual({
    status: "ok",
    service: "hireflow",
  });
});
