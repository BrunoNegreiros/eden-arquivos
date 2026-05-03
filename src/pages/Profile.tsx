import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, deleteUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, arrayRemove } from 'firebase/firestore';
import { ArrowLeft, Camera, Save, AlertTriangle, User, Loader2 } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const currentUser = auth.currentUser;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    
    const [profileDraft, setProfileDraft] = useState({ username: '', photoUrl: '', email: '', newPassword: '', currentPassword: '' });
    
    
    const [isHoldingDelete, setIsHoldingDelete] = useState(false);
    const [deleteProgress, setDeleteProgress] = useState(0);

    useEffect(() => {
        async function loadProfile() {
            if (!currentUser) return;
            const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
            if (userSnap.exists()) {
                const data = userSnap.data();
                setUserProfile(data);
                setProfileDraft({
                    username: data.username || '',
                    photoUrl: data.photoUrl || '',
                    email: currentUser.email || '',
                    newPassword: '',
                    currentPassword: ''
                });
            }
            setLoading(false);
        }
        loadProfile();
    }, [currentUser]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 500; 
                const scale = MAX / img.width;
                canvas.width = MAX;
                canvas.height = img.height * scale;
                canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
                setProfileDraft(prev => ({ ...prev, photoUrl: canvas.toDataURL('image/jpeg', 0.8) }));
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const requiresAuth = profileDraft.email !== currentUser?.email || profileDraft.newPassword;
            if (requiresAuth) {
                if (!profileDraft.currentPassword) throw new Error("Senha atual obrigatória.");
                const cred = EmailAuthProvider.credential(currentUser!.email!, profileDraft.currentPassword);
                await reauthenticateWithCredential(currentUser!, cred);
                
                if (profileDraft.email !== currentUser?.email) await updateEmail(currentUser!, profileDraft.email);
                if (profileDraft.newPassword) await updatePassword(currentUser!, profileDraft.newPassword);
            }
            
            await updateDoc(doc(db, 'users', currentUser!.uid), {
                username: profileDraft.username,
                photoUrl: profileDraft.photoUrl
            });
            alert("Perfil atualizado com sucesso!");
            navigate('/');
        } catch (err: any) {
            console.error(err);
            alert("Erro ao atualizar: Verifique se sua senha atual está correta.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!profileDraft.currentPassword) {
            alert("A senha atual é necessária para excluir a conta.");
            return;
        }
        setIsSaving(true);
        try {
            const cred = EmailAuthProvider.credential(currentUser!.email!, profileDraft.currentPassword);
            await reauthenticateWithCredential(currentUser!, cred);

            const joinedMesas = userProfile?.joinedMesas || [];
            for (const mId of joinedMesas) {
                const mSnap = await getDoc(doc(db, 'mesas', mId));
                if (mSnap.exists()) {
                    if (mSnap.data().mestreId === currentUser!.uid) {
                        await deleteDoc(doc(db, 'mesas', mId));
                        const qChars = query(collection(db, 'characters'), where('mesaId', '==', mId));
                        const snapChars = await getDocs(qChars);
                        snapChars.forEach(async (d) => await deleteDoc(doc(db, 'characters', d.id)));
                    } else {
                        await updateDoc(doc(db, 'mesas', mId), { members: arrayRemove(currentUser!.uid) });
                    }
                }
            }
            
            await deleteDoc(doc(db, 'users', currentUser!.uid));
            await deleteUser(currentUser!);
        } catch (err) {
            console.error(err);
            alert("Erro ao excluir conta. Verifique sua senha atual.");
            setIsSaving(false);
            setIsHoldingDelete(false);
        }
    };

    useEffect(() => {
        let interval: any;
        if (isHoldingDelete) {
            interval = setInterval(() => {
                setDeleteProgress(p => {
                    if (p >= 100) { clearInterval(interval); handleDeleteAccount(); return 100; }
                    return p + 1;
                });
            }, 100);
        } else {
            setDeleteProgress(0);
        }
        return () => clearInterval(interval);
    }, [isHoldingDelete]);

    if (loading) return <div className="min-h-screen bg-eden-900 flex items-center justify-center"><Loader2 className="text-energia animate-spin" size={40}/></div>;

    return (
        <div className="min-h-screen bg-eden-900 text-eden-100 font-sans p-4 md:p-8 flex justify-center items-start">
            <div className="w-full max-w-2xl bg-eden-800 border border-eden-700 rounded-3xl p-6 md:p-10 shadow-2xl relative mt-4 md:mt-10">
                
                <button onClick={() => navigate('/')} className="absolute top-6 left-6 text-eden-100/50 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>

                <div className="text-center mb-8 mt-4">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-eden-950 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-energia/50 relative overflow-hidden group cursor-pointer shadow-lg" onClick={() => fileInputRef.current?.click()}>
                        {profileDraft.photoUrl ? <img src={profileDraft.photoUrl} className="w-full h-full object-cover" /> : <User size={48} className="text-eden-100/20"/>}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all backdrop-blur-sm">
                            <Camera className="text-white mb-2" size={28}/>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Alterar Foto</span>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
                    <button type="button" onClick={() => { const url = prompt("Cole a URL da imagem:"); if (url) setProfileDraft({...profileDraft, photoUrl: url}); }} className="text-xs text-energia hover:text-yellow-400 transition-colors uppercase font-bold tracking-widest">Ou Usar Link</button>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-eden-100/50 uppercase ml-1 tracking-widest">Nome de Usuário</label>
                            <input required value={profileDraft.username} onChange={e => setProfileDraft({...profileDraft, username: e.target.value})} className="w-full bg-eden-950 border border-eden-700 rounded-xl p-4 text-white outline-none focus:border-energia transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-eden-100/50 uppercase ml-1 tracking-widest">E-mail</label>
                            <input required type="email" value={profileDraft.email} onChange={e => setProfileDraft({...profileDraft, email: e.target.value})} className="w-full bg-eden-950 border border-eden-700 rounded-xl p-4 text-white outline-none focus:border-energia transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-eden-100/50 uppercase ml-1 tracking-widest">Nova Senha (Opcional)</label>
                        <input type="password" value={profileDraft.newPassword} onChange={e => setProfileDraft({...profileDraft, newPassword: e.target.value})} className="w-full bg-eden-950 border border-eden-700 rounded-xl p-4 text-white outline-none focus:border-energia transition-colors" placeholder="Deixe em branco para não alterar" />
                    </div>
                    
                    {(profileDraft.email !== currentUser?.email || profileDraft.newPassword || isHoldingDelete) && (
                        <div className="space-y-2 bg-energia/10 p-5 rounded-2xl border border-energia/30 mt-6 shadow-inner animate-in fade-in slide-in-from-top-4">
                            <label className="text-xs font-black text-energia uppercase ml-1 tracking-widest">Confirme Sua Senha Atual</label>
                            <p className="text-[10px] text-energia/70 px-1 mb-2">Necessária para validar as alterações de segurança acima ou para excluir a conta.</p>
                            <input required type="password" value={profileDraft.currentPassword} onChange={e => setProfileDraft({...profileDraft, currentPassword: e.target.value})} className="w-full bg-eden-950 border border-energia/50 rounded-xl p-4 text-white outline-none focus:border-yellow-400 transition-colors" placeholder="Digite sua senha atual..." />
                        </div>
                    )}

                    <button type="submit" disabled={isSaving} className="w-full py-4 bg-energia text-eden-950 font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-yellow-400 hover:shadow-energia/20 transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50">
                        {isSaving ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> Salvar Perfil</>}
                    </button>

                    <div className="mt-12 pt-8 border-t border-red-900/30">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle size={20} className="text-red-500"/>
                            <h4 className="text-sm font-black text-red-500 uppercase tracking-widest">Zona de Exclusão</h4>
                        </div>
                        <p className="text-xs text-red-200/50 mb-6 leading-relaxed">Apagar sua conta excluirá automaticamente todas as mesas que você mestra e te removerá das que joga. Esta ação não tem volta. Digite sua senha atual no campo acima para habilitar o botão.</p>
                        
                        <button 
                            type="button" disabled={isSaving}
                            onMouseDown={() => setIsHoldingDelete(true)} onMouseUp={() => setIsHoldingDelete(false)} onMouseLeave={() => setIsHoldingDelete(false)}
                            onTouchStart={() => setIsHoldingDelete(true)} onTouchEnd={() => setIsHoldingDelete(false)}
                            className="relative w-full h-14 bg-red-950/50 border border-red-900 rounded-xl overflow-hidden group select-none shadow-md disabled:opacity-50"
                        >
                            <div className="absolute left-0 top-0 h-full bg-red-600 transition-all duration-100 ease-linear" style={{ width: `${deleteProgress}%` }}></div>
                            <span className="relative z-10 font-black text-white uppercase text-xs md:text-sm tracking-widest flex items-center justify-center h-full drop-shadow-md">
                                {deleteProgress > 0 ? `Excluindo Conta... ${deleteProgress}%` : 'Segure por 10s para Excluir'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}