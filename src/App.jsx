import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckSquare, 
  Search, Pencil, X, Mail, ArrowUpDown, AlertTriangle, 
  ExternalLink, FileText, Upload, FileCheck, FileSpreadsheet,
  LayoutGrid, List, LogOut, User, Lock, Eye, EyeOff, Heart
} from 'lucide-react';

// 👇 REMETS TES CLÉS SUPABASE ICI
const supabaseUrl = 'https://mvloohmnvggirpdfhotb.supabase.co';
const supabaseKey = 'sb_publishable_fAGf692lpXVGI1YZgyx3Ew_Dz_tEEYO';


const supabase = createClient(supabaseUrl, supabaseKey);

// --- ECRAN DE CONNEXION ---
const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ text: 'Compte créé ! Tu es connecté.', type: 'success' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage({ text: error.message || "Erreur de connexion", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full border border-gray-100">
        <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full"><Briefcase className="text-blue-600" size={32}/></div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">{isSignUp ? "Créer un compte" : "Bon retour !"}</h1>
        
        <form onSubmit={handleAuth} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input type="email" placeholder="email@exemple.com" className="w-full px-4 py-2 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mot de passe</label>
                <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full px-4 py-2 border rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                </div>
            </div>
            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg">{loading ? 'Chargement...' : (isSignUp ? "S'inscrire" : "Se connecter")}</button>
        </form>
        {message.text && (<div className={`mt-4 p-3 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{message.text}</div>)}
        <div className="mt-6 text-center text-sm text-gray-500"><button onClick={() => setIsSignUp(!isSignUp)} className="ml-1 text-blue-600 font-bold hover:underline">{isSignUp ? "Se connecter" : "S'inscrire"}</button></div>
      </div>
    </div>
  );
};

// --- APP PRINCIPALE ---
const App = () => {
  const [session, setSession] = useState(null);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({}); // Initialisé à objet vide pour éviter le crash
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("date");
  const [viewMode, setViewMode] = useState("list"); 
  const [editingId, setEditingId] = useState(null);
  const [fileLM, setFileLM] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Initialisation Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if(session) fetchData(); 
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if(session) fetchData();
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- FONCTION DE CHARGEMENT SÉCURISÉE ---
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Charger les candidatures
      let { data: apps, error: appError } = await supabase.from('applications').select('*');
      if (appError) console.error("Erreur Apps:", appError);
      setApplications(apps || []);
      
      // 2. Charger le profil (avec maybeSingle pour éviter l'erreur si vide)
      let { data: prof, error: profError } = await supabase.from('profile').select('*').maybeSingle();
      
      if (prof) {
        setProfile(prof);
      } else {
        // Si pas de profil, on tente de le créer
        console.log("Création profil...");
        const { data: newProf, error: createError } = await supabase.from('profile').insert([{}]).select().single();
        if (!createError && newProf) {
            setProfile(newProf);
        } else {
            console.error("Erreur création profil:", createError);
        }
      }
    } catch (error) {
      console.error('Erreur générale:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); setApplications([]); };

  // Si chargement initial ou pas de session
  if (loading && !session) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!session) return <AuthScreen />;

  // --- LOGIQUE APP ---
  const [newApp, setNewApp] = useState({ company: "", role: "", status: "A faire", location: "", source: "LinkedIn", contact_email: "", date: new Date().toISOString().split('T')[0], relanceDone: false, lm_url: "" });

  const uploadFileToSupabase = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('documents').upload(fileName, file);
    if (error) { alert("Erreur upload : " + error.message); return null; }
    const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleProfileUpload = async (file, type) => {
    if (!file) return;
    setUploading(true);
    const url = await uploadFileToSupabase(file);
    if (url) {
      const updateData = type === 'ats' ? { cv_ats: url } : { cv_human: url };
      const { error } = await supabase.from('profile').update(updateData).gt('id', 0); // Update sécurisé
      if (!error) setProfile(prev => ({ ...prev, ...updateData }));
      else {
          // Si update échoue (ex: pas de ligne), on insert
           await supabase.from('profile').insert([updateData]);
           setProfile(prev => ({ ...prev, ...updateData }));
      }
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    let uploadedLMUrl = newApp.lm_url;
    if (fileLM) { const url = await uploadFileToSupabase(fileLM); if (url) uploadedLMUrl = url; }
    const appData = { ...newApp, lm_url: uploadedLMUrl };
    
    if (editingId) {
      const { error } = await supabase.from('applications').update(appData).eq('id', editingId);
      if (!error) { setApplications(applications.map(app => app.id === editingId ? { ...appData, id: editingId } : app)); resetForm(); }
    } else {
      const { data, error } = await supabase.from('applications').insert([appData]).select();
      if (!error && data) { setApplications([data[0], ...applications]); resetForm(); }
      else { console.error("Erreur ajout:", error); alert("Erreur ajout: " + (error?.message || "Inconnue")); }
    }
    setUploading(false);
  };

  // Helpers
  const handleQuickChange = async (id, field, value) => { setApplications(applications.map(app => app.id === id ? { ...app, [field]: value } : app)); await supabase.from('applications').update({ [field]: value }).eq('id', id); };
  const handleDelete = async (id) => { if (window.confirm("Supprimer ?")) { await supabase.from('applications').delete().eq('id', id); setApplications(applications.filter(app => app.id !== id)); }};
  const resetForm = () => { setNewApp({ company: "", role: "", status: "A faire", location: "", source: "LinkedIn", contact_email: "", date: new Date().toISOString().split('T')[0], relanceDone: false, lm_url: "" }); setFileLM(null); setEditingId(null); };
  const calculateRelanceDate = (d) => { if (!d) return "-"; const date = new Date(d); date.setDate(date.getDate() + 15); return date.toLocaleDateString('fr-FR'); };
  const getStatusStyle = (val) => ["bg-gray-100", "bg-blue-100", "bg-purple-100", "bg-green-100", "bg-red-100"].find(c => c.includes(val)) || "bg-gray-100";
  const handleEditClick = (app) => { setNewApp(app); setEditingId(app.id); setFileLM(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  const filteredApps = applications.filter(app => app.company?.toLowerCase().includes(searchTerm.toLowerCase()) || app.role?.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-[98%] mx-auto space-y-6">
          
          {/* HEADER */}
          <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl shadow-md">
              <div className="flex items-center gap-2 font-bold"><Briefcase size={20} className="text-blue-400"/> Suivi Alternance Pro</div>
              <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-400 hidden md:block">{session?.user?.email}</span>
                  <button onClick={handleLogout} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors font-medium text-xs"><LogOut size={14}/> Déconnexion</button>
              </div>
          </div>

          {/* CVs (Sécurisé avec ?.) */}
          <div className="bg-slate-800 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1"><h2 className="text-xl font-bold flex items-center gap-2 mb-2"><FileCheck className="text-blue-300"/> Mes CVs</h2><p className="text-slate-300 text-sm">Tes versions de référence.</p></div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <div className="bg-slate-700 p-3 rounded-lg border border-slate-600 w-full sm:w-64"><div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-blue-300 uppercase">CV ATS</span>{profile?.cv_ats && <a href={profile.cv_ats} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600">Voir</a>}</div><label className="cursor-pointer flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 py-2 rounded text-sm transition-colors border border-dashed border-slate-500"><Upload size={14}/> {profile?.cv_ats ? "Remplacer" : "Uploader"} <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleProfileUpload(e.target.files[0], 'ats')} disabled={uploading}/></label></div>
                  <div className="bg-slate-700 p-3 rounded-lg border border-slate-600 w-full sm:w-64"><div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-blue-300 uppercase">CV Humain</span>{profile?.cv_human && <a href={profile.cv_human} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600">Voir</a>}</div><label className="cursor-pointer flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 py-2 rounded text-sm transition-colors border border-dashed border-slate-500"><Upload size={14}/> {profile?.cv_human ? "Remplacer" : "Uploader"} <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleProfileUpload(e.target.files[0], 'human')} disabled={uploading}/></label></div>
              </div>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
            <div><h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Briefcase className="text-blue-600"/> Mes Candidatures</h1><p className="text-sm text-gray-500 mt-1">{loading ? "Chargement..." : `${filteredApps.length} suivies`}</p></div>
            <div className="flex gap-3">
               <div className="bg-gray-100 p-1 rounded-lg flex"><button onClick={() => setViewMode('list')} className={`px-3 py-1 ${viewMode==='list'?'bg-white shadow':''}`}><List size={16}/></button><button onClick={() => setViewMode('kanban')} className={`px-3 py-1 ${viewMode==='kanban'?'bg-white shadow':''}`}><LayoutGrid size={16}/></button></div>
               <input type="text" placeholder="Recherche..." className="border rounded-lg px-3 py-1" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}/>
            </div>
          </div>

          {/* FORMULAIRE SIMPLIFIÉ */}
          <div className="p-6 rounded-xl shadow-sm border bg-white border-gray-200">
             <div className="flex justify-between mb-4"><h2 className="font-bold flex gap-2"><Plus className="text-blue-600"/> {editingId ? "Modifier" : "Ajouter"}</h2>{editingId && <button onClick={resetForm}><X/></button>}</div>
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Entreprise" className="border p-2 rounded" value={newApp.company} onChange={e=>setNewApp({...newApp, company: e.target.value})} required/>
                <input type="text" placeholder="Poste" className="border p-2 rounded" value={newApp.role} onChange={e=>setNewApp({...newApp, role: e.target.value})} required/>
                <select className="border p-2 rounded" value={newApp.status} onChange={e=>setNewApp({...newApp, status: e.target.value})}>
                    {["A faire", "Postulé", "Entretien", "Accepté", "Refusé"].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <button type="submit" disabled={uploading} className="bg-blue-600 text-white p-2 rounded">{uploading ? "..." : (editingId ? "Update" : "Ajouter")}</button>
             </form>
          </div>

          {/* LISTE */}
          {viewMode === 'list' && (
             <div className="bg-white rounded-xl shadow border overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b"><tr><th className="p-4">Entreprise</th><th className="p-4">Poste</th><th className="p-4">Statut</th><th className="p-4">Relance</th><th className="p-4 text-right">Actions</th></tr></thead>
                    <tbody>
                        {filteredApps.map(app => (
                            <tr key={app.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold">{app.company}</td>
                                <td className="p-4">{app.role}</td>
                                <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${getStatusStyle(app.status)}`}>{app.status}</span></td>
                                <td className="p-4 text-orange-600">{calculateRelanceDate(app.date)}</td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button onClick={()=>handleEditClick(app)}><Pencil size={16} className="text-gray-400 hover:text-blue-600"/></button>
                                    <button onClick={()=>handleDelete(app.id)}><Trash2 size={16} className="text-gray-400 hover:text-red-600"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
          )}
          
          {/* KANBAN */}
          {viewMode === 'kanban' && (
              <div className="flex gap-4 overflow-x-auto pb-4">
                  {["A faire", "Postulé", "Entretien", "Accepté", "Refusé"].map(status => (
                      <div key={status} className="min-w-[250px] bg-gray-100 p-3 rounded-xl">
                          <h3 className="font-bold mb-3 uppercase text-xs text-gray-500">{status}</h3>
                          {filteredApps.filter(a => a.status === status).map(app => (
                              <div key={app.id} className="bg-white p-3 rounded mb-2 shadow-sm border border-gray-200">
                                  <div className="font-bold">{app.company}</div>
                                  <div className="text-xs text-gray-500">{app.role}</div>
                                  <div className="flex justify-between mt-2">
                                      <button onClick={()=>handleEditClick(app)}><Pencil size={14} className="text-gray-300 hover:text-blue-500"/></button>
                                      <select value={app.status} onChange={(e)=>handleQuickChange(app.id, 'status', e.target.value)} className="text-[10px] bg-gray-50 border rounded"><option value="A faire">Move...</option><option value="Postulé">Postulé</option><option value="Entretien">Entretien</option></select>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ))}
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;