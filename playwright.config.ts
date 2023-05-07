import { defineConfig } from '@playwright/test';
import { URL } from './data/constants';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: URL.BASE,
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  }
});