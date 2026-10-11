import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Registrar from './pages/Registrar'
import Verificar from './pages/Verificar'
import Royalties from './pages/Royalties'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/registrar" replace />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/verificar" element={<Verificar />} />
        <Route path="/royalties" element={<Royalties />} />
      </Routes>
    </BrowserRouter>
  )
}