import { useState, useEffect } from 'react';
import AppRoutes from "./routes/AppRoutes";
import { LoadingScreen } from './components/ui/LoadingScreen';

function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [hasShownLoading, setHasShownLoading] = useState(false);

  useEffect(() => {
    // Verificar si ya se mostrÃ³ la pantalla de carga en esta sesiÃ³n
    const loadingShown = sessionStorage.getItem('loadingShown');
    if (loadingShown === 'true') {
      setShowLoading(false);
      setHasShownLoading(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setHasShownLoading(true);
    // Guardar que ya se mostrÃ³ en esta sesiÃ³n
    sessionStorage.setItem('loadingShown', 'true');
  };

  return (
    <>
      {showLoading && !hasShownLoading && (
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      )}
      <AppRoutes />
    </>
  );
}
export default App;

