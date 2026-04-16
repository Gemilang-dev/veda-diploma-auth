import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Issue from './pages/Issue';
import Verify from './pages/Verify';
import Layout from './components/Layout'; // <-- Import Layout baru Anda

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman yang MENGGUNAKAN Sidebar */}
        <Route path="/issue" element={ <Layout> <Issue /> </Layout> } />
        <Route path="/verify" element={ <Layout> <Verify /> </Layout> } />
        
        {/* Redirect default ke issue */}
        <Route path="*" element={<Navigate to="/issue" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;