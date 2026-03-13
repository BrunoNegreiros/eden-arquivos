import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';

import Lobby from './pages/Lobby';
import Home from './pages/Home';
import CreateSheet from './pages/CreateSheet';
import Sheet from './pages/Sheet';
import DMScreen from './pages/DMScreen';
import Auth from './pages/Auth';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-eden-900 flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-energia animate-spin" />
        <span className="text-eden-100/50 font-bold uppercase tracking-widest text-sm">Autenticando...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Auth /> : <Navigate to="/" />} />

        {}
        <Route path="/" element={user ? <Lobby /> : <Navigate to="/login" />} />
        
        {}
        <Route path="/mesa/:mesaId" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/mesa/:mesaId/criar" element={user ? <CreateSheet /> : <Navigate to="/login" />} />
        <Route path="/mesa/:mesaId/ficha/:id" element={user ? <Sheet /> : <Navigate to="/login" />} />
        <Route path="/mesa/:mesaId/mestre" element={user ? <DMScreen /> : <Navigate to="/login" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}