import { activeDataProvider } from '../providers';

export const sourceService = {
  list: () => activeDataProvider.getSources(),
  simulateCommunicationOutage: () => activeDataProvider.simulateCommunicationOutage(),
  resetDemoData: () => activeDataProvider.resetDemoData(),
};
