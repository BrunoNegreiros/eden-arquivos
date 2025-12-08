import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateSheet from './pages/CreateSheet';
import Sheet from './pages/Sheet';
import DMScreen from './pages/DMScreen'; // <--- Importe a nova página

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/criar" element={<CreateSheet />} />
        <Route path="/ficha/:id" element={<Sheet />} />
        <Route path="/mestre" element={<DMScreen />} /> {/* <--- Nova Rota */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;