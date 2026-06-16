import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SettingsProvider } from './lib/useSettings.jsx';
import Landing from './pages/Landing.jsx';
import Studio from './pages/Studio.jsx';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/studio" element={<Studio />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <AnimatedRoutes />
      </HashRouter>
    </SettingsProvider>
  );
}
