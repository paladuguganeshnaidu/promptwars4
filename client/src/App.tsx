// Route configuration with route-level code splitting: each persona page is
// lazily loaded so the initial route ships minimal JavaScript.
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';

import { AppLayout } from './components/appLayout.js';
import { ErrorBoundary } from './components/errorBoundary.js';
import { NotFoundPage } from './components/notFoundPage.js';
import { LoadingState } from './components/statusMessage.js';
import { HomePage } from './features/home/homePage.js';
import { ThemeProvider, useTheme } from './contexts/themeContext.js';
import { getAntdTheme } from './theme.js';

const AssistantPage = lazy(() =>
  import('./features/assistant/assistantPage.js').then((module) => ({
    default: module.AssistantPage,
  })),
);
const OperationsPage = lazy(() =>
  import('./features/operations/operationsPage.js').then((module) => ({
    default: module.OperationsPage,
  })),
);

function AppRoutes(): React.JSX.Element {
  const { theme } = useTheme();
  const antdTheme = getAntdTheme(theme);

  return (
    <ConfigProvider theme={antdTheme}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <ErrorBoundary>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route
              path="assistant"
              element={
                <Suspense fallback={<LoadingState label="Loading the assistant…" />}>
                  <AssistantPage />
                </Suspense>
              }
            />
            <Route
              path="operations"
              element={
                <Suspense fallback={<LoadingState label="Loading operations…" />}>
                  <OperationsPage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

/** Root application component wiring routes, layout and error handling. */
export function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}
