import WebGPUBenchmarkPage from "./ui/pages/WebGPUBenchmarkPage";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreatorDashboard from './pages/CreatorDashboard';
import FullstackArchitecture from './pages/FullstackArchitecture';
import ProvenanceWormgraph from './pages/ProvenanceWormgraph';
import RoyaltiesSolanaBlinks from './pages/RoyaltiesSolanaBlinks';
import WorkRegistrationC2Pa from './pages/WorkRegistrationC2Pa';
import WorksExplorer from './pages/WorksExplorer';
import JorgeBenJorVsRodStewartDemo from './demo/JorgeBenJorVsRodStewart';
import Registrar from '../app/src/pages/Registrar';
import Verificar from '../app/src/pages/Verificar';
import Royalties from '../app/src/pages/Royalties';
import '../app/src/style.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/registrar" replace />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/verificar" element={<Verificar />} />
        <Route path="/royalties" element={<Royalties />} />
        <Route path="/creator" element={<CreatorDashboard />} />
        <Route path="/architecture" element={<FullstackArchitecture />} />
        <Route path="/wormgraph" element={<ProvenanceWormgraph />} />
        <Route path="/royalties-solana" element={<RoyaltiesSolanaBlinks />} />
        <Route path="/registration" element={<WorkRegistrationC2Pa />} />
        <Route path="/works" element={<WorksExplorer />} />
        <Route path="/benchmark" element={<WebGPUBenchmarkPage />} />
        <Route path="/demo" element={<JorgeBenJorVsRodStewartDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
