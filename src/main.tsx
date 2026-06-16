import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ConfigProvider } from 'antd';
import { Toaster, TooltipProvider } from '@frontend-team/ui-kit';
import '@frontend-team/ui-kit/style.css';
import App from './App.tsx';
import './index.css';
import { store, persistor } from './assets/app-data/store';
import { createAntdTheme } from './theme/antd-theme';
import { applyThemeMode, getInitialTheme, THEME_CHANGE_EVENT, THEME_KEY, type ThemeMode } from './theme/theme-mode';

function RootProviders() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      setThemeMode((event as CustomEvent<ThemeMode>).detail);
    };
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === THEME_KEY && (event.newValue === 'light' || event.newValue === 'dark')) {
        setThemeMode(event.newValue);
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider theme={createAntdTheme(themeMode)}>
          <TooltipProvider>
            <App />
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootProviders />
  </React.StrictMode>,
);
