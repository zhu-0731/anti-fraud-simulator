import { expect, test } from './fixtures/logged-test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
});

test('starts the defender flow and exposes core views', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '确认之前' })).toBeVisible();
  await expect(page.getByText('反诈生存')).toBeVisible();
  await expect(page.getByText('红队测试')).toBeVisible();
  await expect(page.getByText('任务背景')).toBeVisible();
  await page.getByRole('button', { name: '标准' }).click();
  await page.getByRole('button', { name: '开始模拟' }).click();

  await expect(page.getByRole('heading', { name: '消息' })).toBeVisible();
  await expect(page.getByText('调试面板')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /保研互助群/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /招生办-张老师/ })).toBeVisible();

  await page.getByRole('button', { name: /招生办-张老师/ }).click();
  await expect(page.getByPlaceholder('输入消息…')).toBeVisible();
  await page.getByPlaceholder('输入消息…').fill('请问怎么核实你的身份？');
  await page.getByRole('button', { name: '↑' }).click();
  await expect(page.getByText('请问怎么核实你的身份？')).toBeVisible();

  await page.getByRole('button', { name: /官网/ }).click();
  await expect(page.getByText('Z大学研究生院', { exact: true })).toBeVisible();
  await expect(page.getByText('官方声明')).toBeVisible();

  await page.getByRole('button', { name: /电话/ }).click();
  await expect(page.getByText('拨打电话')).toBeVisible();
  await expect(page.getByText('Z大招生办（官网）')).toBeVisible();
  await page.getByRole('button', { name: '拨打Z大招生办（官网）' }).click();
  await expect(page.getByText('通话结果')).toBeVisible();
  await expect(page.getByText('拨打电话')).toBeVisible();

  await page.getByRole('button', { name: /证据/ }).click();
  await expect(page.getByText('证据收集')).toBeVisible();
});

test('enters emergency handling after simulated information disclosure', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '开始模拟' }).click();
  await page.getByRole('button', { name: /招生办-张老师/ }).click();
  await page.getByPlaceholder('输入消息…').fill('我来提交信息');
  await page.getByRole('button', { name: '↑' }).click();

  await expect(page.getByText('紧急处置')).toBeVisible();
  await expect(page.getByText('个人信息可能已泄露')).toBeVisible();
  await expect(page.getByRole('button', { name: '立即停止所有可疑操作' })).toBeVisible();
  await expect(page.getByRole('button', { name: '拨打110或咨询96110（反诈热线）' })).toBeVisible();
  await page.getByRole('button', { name: /查看复盘报告/ }).click();
  await expect(page.getByRole('heading', { name: '复盘报告' })).toBeVisible();
  await expect(page.getByText('AI 技能与核实复盘')).toBeVisible();
  await expect(page.getByText('证据追踪')).toBeVisible();
});

test('completes a safe verification path through official channels', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '开始模拟' }).click();
  await page.getByRole('button', { name: /官网/ }).click();
  await page.getByRole('button', { name: /完成核实并查看复盘/ }).click();

  await expect(page.getByRole('heading', { name: '复盘报告' })).toBeVisible();
  await expect(page.getByText('AI 技能与核实复盘')).toBeVisible();
  await expect(page.getByText('证据追踪')).toBeVisible();
  await expect(page.getByText('个人信息可能已泄露')).toHaveCount(0);
  await page.getByRole('button', { name: '重新开始' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: '重新开始' })).toBeVisible();
});
