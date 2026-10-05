import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreatorDashboard from './pages/CreatorDashboard';
import FullstackArchitecture from './pages/FullstackArchitecture';
import ProvenanceWormgraph from './pages/ProvenanceWormgraph';
import RoyaltiesSolanaBlinks from './pages/RoyaltiesSolanaBlinks';
import WorkRegistrationC2Pa from './pages/WorkRegistrationC2Pa';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/creator" />} />
        <Route path="/creator" element={<CreatorDashboard />} />
        <Route path="/architecture" element={<FullstackArchitecture />} />
        <Route path="/wormgraph" element={<ProvenanceWormgraph />} />
        <Route path="/royalties" element={<RoyaltiesSolanaBlinks />} />
        <Route path="/registration" element={<WorkRegistrationC2Pa />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
