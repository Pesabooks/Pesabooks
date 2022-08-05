import { GA4React } from 'ga-4-react';

const ga4react = new GA4React(process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || '').initialize();

export interface AnalyticsData {
  path: string;
  search: string;
  title: string;
}

const trackPathForAnalytics = (data: AnalyticsData) => {
  if (process.env.REACT_APP_ENV === 'development') return;

  const { path, search } = data;

  const parts = path.split('/');
  const name = parts[parts.length - 1];
  ga4react
    .then((ga) => {
      ga.pageview(path, search, name);
    })
    .catch((err) => console.error(`Analytics failed: ${err}`));
};

export default trackPathForAnalytics;
