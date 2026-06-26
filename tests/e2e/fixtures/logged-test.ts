import { expect, test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, runPage, testInfo) => {
    const logs: string[] = [];
    const errors: string[] = [];
    const networkErrors: string[] = [];

    page.on('console', (message) => {
      const line = `[console:${message.type()}] ${message.text()}`;
      logs.push(line);
      if (message.type() === 'error') errors.push(line);
    });

    page.on('pageerror', (error) => {
      errors.push(`[pageerror] ${error.message}`);
    });

    page.on('requestfailed', (request) => {
      networkErrors.push(
        `[requestfailed] ${request.method()} ${request.url()} ${
          request.failure()?.errorText ?? 'unknown'
        }`,
      );
    });

    page.on('response', (response) => {
      if (response.url().includes('/api/') && response.status() >= 400) {
        networkErrors.push(`[response] ${response.status()} ${response.url()}`);
      }
    });

    await runPage(page);

    await testInfo.attach('browser-console.log', {
      body: Buffer.from(logs.join('\n')),
      contentType: 'text/plain',
    });
    await testInfo.attach('browser-errors.log', {
      body: Buffer.from(errors.join('\n')),
      contentType: 'text/plain',
    });
    await testInfo.attach('network-errors.log', {
      body: Buffer.from(networkErrors.join('\n')),
      contentType: 'text/plain',
    });

    expect(errors, 'browser errors').toEqual([]);
    expect(networkErrors, 'network errors').toEqual([]);
  },
});

export { expect };
