import { activeDataProvider } from '../providers';

export const incidentService = {
  list: () => activeDataProvider.getIncidents(),
  getById: (id: string) => activeDataProvider.getIncidentById(id),
  listCommunicationIncidents: () => activeDataProvider.getCommunicationIncidents(),
  getActivity: () => activeDataProvider.getActivity(),
};
