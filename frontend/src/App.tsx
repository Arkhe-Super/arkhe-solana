import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreatorDashboard from './pages/CreatorDashboard';
import ProvenanceWormgraph from './pages/ProvenanceWormgraph';
import RoyaltiesSolanaBlinks from './pages/RoyaltiesSolanaBlinks';
import WorkRegistrationC2Pa from './pages/WorkRegistrationC2Pa';
import WorksExplorer from './pages/WorksExplorer';
import MusicCaseStudy from './pages/MusicCaseStudy';
import ApplicationNavigation from './ui/components/ApplicationNavigation';

function App() {
  return (
    <BrowserRouter>
      <ApplicationNavigation />
      <Routes>
        <Route path="/" element={<Navigate to="/creator" />} />
        <Route path="/creator" element={<CreatorDashboard />} />
        <Route path="/architecture" element={<Navigate to="/creator" replace />} />
        <Route path="/wormgraph" element={<ProvenanceWormgraph />} />
        <Route path="/royalties" element={<RoyaltiesSolanaBlinks />} />
        <Route path="/registration" element={<WorkRegistrationC2Pa />} />
        <Route path="/works" element={<WorksExplorer />} />
        <Route path="/benchmark" element={<Navigate to="/creator" replace />} />
        <Route path="/demo" element={<MusicCaseStudy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
