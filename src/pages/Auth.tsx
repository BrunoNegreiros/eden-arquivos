import { useState } from 'react';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { LogIn, UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: username });

        // Gravamos como 'jogador' por padrão, já que o cargo não importa mais
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          username,
          email,
          joinedMesas: [],
          createdAt: Date.now()
        });

      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return alert("Digite seu email primeiro.");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Email de recuperação enviado!");
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="min-h-screen bg-eden-900 flex items-center justify-center p-4 font-sans text-eden-100">
      <div className="w-full max-w-md bg-eden-800 border border-eden-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        <div className="bg-eden-950 p-8 text-center border-b border-eden-700">
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-eden-1 to-eden-2">EDEN: ARQUIVOS</h1>
            <p className="text-eden-100/40 text-xs uppercase tracking-widest mt-2">
                {isRegistering ? 'Criar Nova Identidade' : 'Acessar Terminal'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {isRegistering && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-eden-100/50 flex items-center gap-2"><User size={12}/> Nome de Usuário</label>
              <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-eden-900 border border-eden-700 rounded-xl p-3 text-sm focus:border-energia outline-none transition-colors" placeholder="Ex: Senhor_Verissimo"/>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-eden-100/50 flex items-center gap-2"><Mail size={12}/> Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-eden-900 border border-eden-700 rounded-xl p-3 text-sm focus:border-energia outline-none transition-colors" placeholder="seu@email.com"/>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-eden-100/50 flex items-center gap-2"><Lock size={12}/> Senha</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-eden-900 border border-eden-700 rounded-xl p-3 text-sm focus:border-energia outline-none transition-colors" placeholder="••••••••"/>
          </div>

          {!isRegistering && (
            <div className="flex justify-between items-center px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="accent-energia w-4 h-4"/>
                    <span className="text-[10px] font-bold text-eden-100/40 group-hover:text-eden-100 transition-colors uppercase">Lembrar-me</span>
                </label>
                <button type="button" onClick={handleForgotPassword} className="text-[10px] font-bold text-energia hover:text-yellow-400 uppercase tracking-tighter">Esqueci a senha</button>
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full py-4 bg-gradient-to-r from-eden-1 to-eden-2 text-eden-900 font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : isRegistering ? <><UserPlus size={20}/> CRIAR CONTA</> : <><LogIn size={20}/> ENTRAR</>}
          </button>

          <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="w-full text-center text-xs font-bold text-eden-100/30 hover:text-eden-100 transition-colors py-2 uppercase tracking-widest">
            {isRegistering ? 'Já possui uma conta? Login' : 'Não tem conta? Registre-se'}
          </button>
        </form>
      </div>
    </div>
  );
}