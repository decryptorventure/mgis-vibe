import { RouterProvider } from 'react-router-dom';
import { appRouter } from '@/routes/appRoutes';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={appRouter} />
    </ErrorBoundary>
  );
}

export default App;
