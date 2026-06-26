import { expect, test } from './fixtures/logged-test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
});

test('starts the defender flow and exposes core views', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '确认之前' })).toBeVisible();
  await page.getByRole('button', { name: '开始模拟' }).click();

  await expect(page.getByRole('heading', { name: '消息' })).toBeVisible();
  await expect(page.getByRole('button', { name: /保研互助群/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /招生办-张老师/ })).toBeVisible();

  await page.getByRole('button', { name: /招生办-张老师/ }).click();
  await expect(page.getByText('招生办-张老师（未认证）')).toBeVisible();
  await page.getByPlaceholder('输入消息…').fill('请问怎么核实你的身份？');
  await page.getByRole('button', { name: '↑' }).click();
  await expect(page.getByText('请问怎么核实你的身份？')).toBeVisible();

  await page.getByRole('button', { name: /官网/ }).click();
  await expect(page.getByText('Z大学研究生院', { exact: true })).toBeVisible();
  await expect(page.getByText('官方声明')).toBeVisible();

  await page.getByRole('button', { name: /电话/ }).click();
  await expect(page.getByText('拨打电话')).toBeVisible();
  await expect(page.getByText('Z大招生办（官网）')).toBeVisible();

  await page.getByRole('button', { name: /证据/ }).click();
  await expect(page.getByText('证据收集')).toBeVisible();
});
