import { activeDataProvider } from '../providers';

export const intelligenceService = {
  listScenarios: () => activeDataProvider.getIntelligenceScenarios(),
  listLiveCompoundGroups: () => activeDataProvider.getLiveCompoundGroups(),
  getSpaceWeather: () => activeDataProvider.getSpaceWeather(),
  getDisasterSummary: () => activeDataProvider.getDisasterSummary(),
  getCommunicationSummary: () => activeDataProvider.getCommunicationSummary(),
};
