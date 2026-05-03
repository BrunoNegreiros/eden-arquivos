import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';

import Lobby from './pages/Lobby';
import Home from './pages/Home';
import CreateSheet from './pages/CreateSheet';
import Sheet from './pages/Sheet';
import DMScreen from './pages/DMScreen';
import Auth from './pages/Auth';
import TeamDashboard from './pages/TeamDashboard';
import TeamHub from './pages/TeamHub';
import TeamGames from './pages/TeamGames';
import TeamCemetery from './pages/TeamCemetery';
import TeamChat from './pages/TeamChat';
import Profile from './pages/Profile';
import { Loader2 } from 'lucide-react';


const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>('loading');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    if (user === 'loading') {
        return (
            <div className="h-screen bg-eden-900 flex flex-col items-center justify-center gap-4">
                <Loader2 size={40} className="text-energia animate-spin" />
                <span className="text-eden-100/50 font-bold uppercase tracking-widest text-sm">Autenticando...</span>
            </div>
        );
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

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

        <Route path="/" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/mesa/:mesaId" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/mesa/:mesaId/criar" element={<ProtectedRoute><CreateSheet /></ProtectedRoute>} />
        <Route path="/mesa/:mesaId/ficha/:id" element={<ProtectedRoute><Sheet /></ProtectedRoute>} />
        <Route path="/mesa/:mesaId/mestre" element={<ProtectedRoute><DMScreen /></ProtectedRoute>} />
        
        {}
        <Route path="/mesa/:mesaId/grupo" element={<ProtectedRoute><TeamHub /></ProtectedRoute>} />
        <Route path="/mesa/:mesaId/grupo/dashboard" element={<ProtectedRoute><TeamDashboard /></ProtectedRoute>} />
        <Route path="/mesa/:mesaId/grupo/jogos" element={<ProtectedRoute><TeamGames /></ProtectedRoute>} />
        <Route path="/mesa/:mesaId/grupo/cemiterio" element={<ProtectedRoute><TeamCemetery /></ProtectedRoute>} />
        <Route path="/mesa/:mesaId/grupo/chat" element={<ProtectedRoute><TeamChat /></ProtectedRoute>} />
        
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}