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
    <div className="min-h-screen bg-eden-900 flex items-center justify-center p-4 font-sans text-eden-100 relative overflow-hidden">

      <div className="w-full max-w-md md:max-w-lg bg-eden-800/95 backdrop-blur-sm border border-eden-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 relative z-10">
        
        <div className="bg-eden-950/80 p-8 md:p-10 text-center border-b border-eden-700 flex flex-col items-center">
            <div className="flex items-center justify-center gap-3">              
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-eden-1 to-eden-2">EDEN: ARQUIVOS </h1>                
            </div>
            <p className="text-eden-100/40 text-xs md:text-sm uppercase tracking-widest mt-2">
                {isRegistering ? 'Criar Nova Identidade' : 'Acessar Terminal'}
            </p>            
        </div>


        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-5 md:space-y-6">
          {isRegistering && (
            <div className="space-y-1 md:space-y-2">
              <label className="text-[10px] md:text-xs uppercase font-bold text-eden-100/50 flex items-center gap-2"><User size={14}/> Nome de Usuário</label>
              <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-eden-900 border border-eden-700 rounded-xl p-3 md:p-4 text-sm md:text-base focus:border-energia outline-none transition-colors" placeholder="Ex: Senhor_Verissimo"/>
            </div>
          )}

          <div className="space-y-1 md:space-y-2">
            <label className="text-[10px] md:text-xs uppercase font-bold text-eden-100/50 flex items-center gap-2"><Mail size={14}/> Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-eden-900 border border-eden-700 rounded-xl p-3 md:p-4 text-sm md:text-base focus:border-energia outline-none transition-colors" placeholder="seu@email.com"/>
          </div>

          <div className="space-y-1 md:space-y-2">
            <label className="text-[10px] md:text-xs uppercase font-bold text-eden-100/50 flex items-center gap-2"><Lock size={14}/> Senha</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-eden-900 border border-eden-700 rounded-xl p-3 md:p-4 text-sm md:text-base focus:border-energia outline-none transition-colors" placeholder="••••••••"/>
          </div>

          {!isRegistering && (
            <div className="flex justify-between items-center px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="accent-energia w-4 h-4 md:w-5 md:h-5"/>
                    <span className="text-[10px] md:text-xs font-bold text-eden-100/40 group-hover:text-eden-100 transition-colors uppercase">Lembrar-me</span>
                </label>
                <button type="button" onClick={handleForgotPassword} className="text-[10px] md:text-xs font-bold text-energia hover:text-yellow-400 uppercase tracking-tighter">Esqueci a senha</button>
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full py-4 md:py-5 bg-gradient-to-r from-eden-1 to-eden-2 text-eden-900 font-black text-base md:text-lg uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
            {loading ? <Loader2 className="animate-spin" /> : isRegistering ? <><UserPlus size={22}/> CRIAR CONTA</> : <><LogIn size={22}/> ENTRAR</>}
          </button>

          <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="w-full text-center text-xs md:text-sm font-bold text-eden-100/30 hover:text-eden-100 transition-colors py-2 uppercase tracking-widest">
            {isRegistering ? 'Já possui uma conta? Login' : 'Não tem conta? Registre-se'}
          </button>
        </form>        
      </div>      
    </div>
  );
}