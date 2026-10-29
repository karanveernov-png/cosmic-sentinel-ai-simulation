import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { CommunicationsPage } from '../pages/CommunicationsPage';
import { CompoundIntelligencePage } from '../pages/CompoundIntelligencePage';
import { EarthDisastersPage } from '../pages/EarthDisastersPage';
import { IncidentIntelligencePage } from '../pages/IncidentIntelligencePage';
import { OverviewPage } from '../pages/OverviewPage';
import { ResponsePlanningPage } from '../pages/ResponsePlanningPage';
import { SourcesPage } from '../pages/SourcesPage';
import { SpaceWeatherPage } from '../pages/SpaceWeatherPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'incidents', element: <IncidentIntelligencePage /> },
      { path: 'compound-intelligence', element: <CompoundIntelligencePage /> },
      { path: 'space-weather', element: <SpaceWeatherPage /> },
      { path: 'earth-disasters', element: <EarthDisastersPage /> },
      { path: 'communications', element: <CommunicationsPage /> },
      { path: 'response-planning', element: <ResponsePlanningPage /> },
      { path: 'sources', element: <SourcesPage /> },
    ],
  },
]);
