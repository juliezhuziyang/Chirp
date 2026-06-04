import { useCallback, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { RouterProvider } from 'react-router';
import { LoadingScreen } from './components/LoadingScreen';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {!isLoading && (
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      )}
    </>
  );
}