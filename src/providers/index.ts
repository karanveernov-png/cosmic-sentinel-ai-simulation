import { env } from '../config/environment';
import type { DataProvider } from './dataProvider';
import { httpDataProvider } from './httpDataProvider';
import { mockDataProvider } from './mockDataProvider';

export const activeDataProvider: DataProvider = env.dataProvider === 'http' ? httpDataProvider : mockDataProvider;

export type { DataProvider } from './dataProvider';
