import { activeDataProvider } from '../providers';

export const responseService = {
  listPlans: () => activeDataProvider.getResponsePlans(),
};
