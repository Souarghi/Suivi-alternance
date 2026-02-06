import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckSquare, 
  Search, Pencil, X, Mail, AlertTriangle, ExternalLink, FileText, 
  Upload, FileCheck, FileSpreadsheet, List, LogOut, User, Lock, Eye, EyeOff
} from 'lucide-react';

// 👇 REMETS TES CLÉS SUPABASE ICI
const supabaseUrl = 'https://mvloohmnvggirpdfhotb.supabase.co';
const supabaseKey = 'sb_publishable_fAGf692lpXVGI1YZgyx3Ew_Dz_tEEYO';


// Sécurité : empêche le crash si les clés sont vides
const safeSupabase = () => {
  if (!supabaseUrl || supabaseUrl.includes('TON_URL')) return null;
  return createClient(supabaseUrl, supabaseKey);
};
const supabase = safeSupabase();

// --- ECRAN DE CONNEXION ---
const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return alert("Clés Supabase manquantes dans le code !");
    setLoading(true);
    setMessage('');
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Compte créé ! Tu peux te connecter.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-gray-800">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full border border-gray-100">
        <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full"><Briefcase className="text-blue-600" size={32}/></div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">{isSignUp ? "Créer un compte" : "Connexion"}</h1>
        <form onSubmit={handleAuth} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <div className="relative"><User className="absolute left-3 top-2.5 text-gray-400" size={18}/><input type="email" placeholder="Email" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mot de passe</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                </div>
            </div>
            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors">{loading ? '...' : (isSignUp ? "S'inscrire" : "Se connecter")}</button>
        </form>
        {message && <div className={`mt-4 p-3 rounded text-sm text-center ${message.includes('créé') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{message}</div>}
        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 w-full text-sm text-blue-600 hover:underline text-center block">{isSignUp ? "J'ai déjà un compte" : "Créer un compte"}</button>
      </div>
    </div>
  );
};

// --- APP PRINCIPALE ---
const App = () => {
  // 1. TOUS LES HOOKS (useState) DOIVENT ÊTRE DÉCLARÉS ICI (AVANT tout return)
  const [session, setSession] = useState(null);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); 
  const [editingId, setEditingId] = useState(null);
  const [fileLM, setFileLM] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newApp, setNewApp] = useState({ company: "", role: "", status: "A faire", location: "", source: "LinkedIn", contact_email: "", date: new Date().toISOString().split('T')[0], lm_url: "" });

  // 2. USE EFFECT
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. FONCTIONS
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: apps } = await supabase.from('applications').select('*');
      setApplications(apps || []);
      
      const { data: prof } = await supabase.from('profile').select('*').limit(1).maybeSingle();
      if (prof) setProfile(prof);
      else {
         const { data: newProf } = await supabase.from('profile').insert([{}]).select().single();
         if (newProf) setProfile(newProf);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); setApplications([]); };

  const uploadFile = async (file) => {
    if (!file) return null;
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('documents').upload(fileName, file);
    if (error) { alert("Erreur upload: " + error.message); return null; }
    const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleProfileUpload = async (file, type) => {
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) {
      const updateData = type === 'ats' ? { cv_ats: url } : { cv_human: url };
      if (!profile.id) await supabase.from('profile').insert([updateData]);
      else await supabase.from('profile').update(updateData).gt('id', 0);
      setProfile(prev => ({ ...prev, ...updateData }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    let url = newApp.lm_url;
    if (fileLM) { const u = await uploadFile(fileLM); if(u) url = u; }
    
    const appData = { ...newApp, lm_url: url };
    
    if (editingId) {
      await supabase.from('applications').update(appData).eq('id', editingId);
      setApplications(prev => prev.map(a => a.id === editingId ? { ...a, ...appData } : a));
    } else {
      const { data } = await supabase.from('applications').insert([appData]).select();
      if (data) setApplications([data[0], ...applications]);
    }
    setNewApp({ company: "", role: "", status: "A faire", location: "", source: "LinkedIn", contact_email: "", date: new Date().toISOString().split('T')[0], lm_url: "" });
    setFileLM(null);
    setEditingId(null);
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ?")) {
      await supabase.from('applications').delete().eq('id', id);
      setApplications(prev => prev.filter(a => a.id !== id));
    }
  };

  const filteredApps = applications.filter(a => a.company?.toLowerCase().includes(searchTerm.toLowerCase()));

  // 4. AFFICHAGE CONDITIONNEL (LE RETURN DOIT ÊTRE À LA FIN)
  if (!supabase) return <div className="p-10 text-red-600 font-bold text-center">ERREUR : Clés Supabase manquantes dans App.js (lignes 11-12).</div>;
  if (loading && !session) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500">Chargement...</div>;
  if (!session) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* HEADER */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-lg">
            <div className="font-bold flex items-center gap-2 text-lg"><Briefcase/> Suivi Alternance</div>
            <div className="flex items-center gap-3">
               <span className="text-xs text-slate-400 hidden sm:block">{session.user.email}</span>
               <button onClick={handleLogout} className="bg-red-600 px-3 py-1.5 rounded text-xs hover:bg-red-700 flex items-center gap-1 font-bold transition-colors"><LogOut size={14}/> Sortir</button>
            </div>
          </div>

          {/* CVS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h2 className="font-bold mb-4 flex gap-2 items-center text-lg"><FileCheck className="text-blue-600"/> Mes CVs</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded border border-gray-200">
                   <div className="text-xs font-bold text-gray-500 mb-2 uppercase">CV ATS (Robot)</div>
                   <div className="flex gap-2 items-center">
                      {profile?.cv_ats ? <a href={profile.cv_ats} target="_blank" rel="noreferrer" className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded font-bold border border-green-200">Voir le fichier</a> : <span className="text-xs text-gray-400 italic">Aucun fichier</span>}
                      <label className="cursor-pointer bg-white border px-2 py-1 rounded text-xs hover:bg-gray-50 flex gap-1 items-center">{uploading ? "..." : <><Upload size={12}/> {profile?.cv_ats ? "Changer" : "Ajouter"}</>}<input type="file" className="hidden" onChange={(e) => handleProfileUpload(e.target.files[0], 'ats')} disabled={uploading}/></label>
                   </div>
                </div>
                <div className="bg-slate-50 p-4 rounded border border-gray-200">
                   <div className="text-xs font-bold text-gray-500 mb-2 uppercase">CV Design (Humain)</div>
                   <div className="flex gap-2 items-center">
                      {profile?.cv_human ? <a href={profile.cv_human} target="_blank" rel="noreferrer" className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded font-bold border border-green-200">Voir le fichier</a> : <span className="text-xs text-gray-400 italic">Aucun fichier</span>}
                      <label className="cursor-pointer bg-white border px-2 py-1 rounded text-xs hover:bg-gray-50 flex gap-1 items-center">{uploading ? "..." : <><Upload size={12}/> {profile?.cv_human ? "Changer" : "Ajouter"}</>}<input type="file" className="hidden" onChange={(e) => handleProfileUpload(e.target.files[0], 'human')} disabled={uploading}/></label>
                   </div>
                </div>
             </div>
          </div>

          {/* BARRE OUTILS */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 ${viewMode==='list' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}><List size={16}/> Liste</button>
                <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 ${viewMode==='kanban' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}><Briefcase size={16}/> Kanban</button>
            </div>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                <input placeholder="Rechercher une entreprise..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
            </div>
          </div>

          {/* FORMULAIRE */}
          <div className={`p-6 rounded-xl shadow-sm border ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
             <div className="flex justify-between mb-4">
                <h2 className="font-bold flex gap-2 items-center text-lg">{editingId ? <><Pencil className="text-orange-500"/> Modifier la candidature</> : <><Plus className="text-blue-600"/> Nouvelle candidature</>}</h2>
                {editingId && <button onClick={() => {setEditingId(null); setNewApp({ company: "", role: "", status: "A faire", location: "", source: "LinkedIn", contact_email: "", date: new Date().toISOString().split('T')[0], lm_url: "" });}} className="text-gray-500 hover:text-gray-700"><X/></button>}
             </div>
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input placeholder="Entreprise (ex: Thales)" className="border p-2 rounded text-sm" value={newApp.company} onChange={e=>setNewApp({...newApp, company: e.target.value})} required/>
                <input placeholder="Poste (ex: Développeur)" className="border p-2 rounded text-sm" value={newApp.role} onChange={e=>setNewApp({...newApp, role: e.target.value})} required/>
                <select className="border p-2 rounded text-sm bg-white" value={newApp.status} onChange={e=>setNewApp({...newApp, status: e.target.value})}>
                   {["A faire", "Postulé", "Entretien", "Accepté", "Refusé"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button disabled={uploading} className={`text-white font-bold p-2 rounded text-sm transition-colors ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>{uploading ? "Envoi..." : (editingId ? "Sauvegarder" : "Ajouter")}</button>
             </form>
          </div>

          {/* VUES */}
          {viewMode === 'list' ? (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                   <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs font-bold"><tr><th className="p-4">Entreprise</th><th className="p-4">Poste</th><th className="p-4">Statut</th><th className="p-4 text-right">Actions</th></tr></thead>
                   <tbody className="divide-y">
                      {filteredApps.map(app => (
                         <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-bold text-gray-800">{app.company}</td>
                            <td className="p-4 text-gray-600">{app.role}</td>
                            <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${app.status === 'A faire' ? 'bg-gray-100 text-gray-600' : app.status === 'Postulé' ? 'bg-blue-100 text-blue-700' : app.status === 'Entretien' ? 'bg-purple-100 text-purple-700' : app.status === 'Accepté' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{app.status}</span></td>
                            <td className="p-4 text-right flex justify-end gap-2">
                               <button onClick={() => {setNewApp(app); setEditingId(app.id); window.scrollTo({top:0, behavior:'smooth'});}} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={18}/></button>
                               <button onClick={() => handleDelete(app.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                            </td>
                         </tr>
                      ))}
                      {filteredApps.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-400 italic">Aucune candidature trouvée.</td></tr>}
                   </tbody>
                </table>
             </div>
          ) : (
             <div className="flex gap-4 overflow-x-auto pb-6">
                {["A faire", "Postulé", "Entretien", "Accepté", "Refusé"].map(status => (
                   <div key={status} className="min-w-[280px] w-80 bg-gray-100 p-4 rounded-xl flex flex-col gap-3 shrink-0 h-fit">
                      <h3 className="font-bold text-xs uppercase text-gray-500 flex justify-between">{status} <span className="bg-gray-200 px-2 rounded-full text-gray-600">{filteredApps.filter(a => a.status === status).length}</span></h3>
                      {filteredApps.filter(a => a.status === status).map(app => (
                         <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-1">
                                <div className="font-bold text-gray-800">{app.company}</div>
                                <button onClick={() => handleDelete(app.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                            </div>
                            <div className="text-xs text-gray-500 mb-3">{app.role}</div>
                            <button onClick={() => {setNewApp(app); setEditingId(app.id); window.scrollTo({top:0, behavior:'smooth'});}} className="w-full text-center text-xs border border-blue-100 text-blue-600 py-1.5 rounded hover:bg-blue-50 font-medium">Modifier</button>
                         </div>
                      ))}
                   </div>
                ))}
             </div>
          )}
        </div>
      </div>
      
      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 p-6 text-center text-sm text-gray-500">
        <p>© 2025 - Suivi Alternance - <a href="mailto:ton.email@pro.com" className="text-blue-600 hover:underline">ton.email@pro.com</a></p>
      </footer>
    </div>
  );
};

export default App;