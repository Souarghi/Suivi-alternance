
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckSquare, 
  Search, Pencil, X, Mail, AlertTriangle, ExternalLink, FileText, 
  Upload, FileCheck, FileSpreadsheet, List, LogOut, User, Lock, Eye, EyeOff, Heart, LayoutGrid,
  Filter, CheckCircle, RefreshCw
} from 'lucide-react';

// 👇 REMETS TES CLÉS SUPABASE ICI
const supabaseUrl = 'https://mvloohmnvggirpdfhotb.supabase.co';
const supabaseKey = 'sb_publishable_fAGf692lpXVGI1YZgyx3Ew_Dz_tEEYO';

// Sécurité
const safeSupabase = () => {
  if (!supabaseUrl || supabaseUrl.includes('TON_URL')) return null;
  return createClient(supabaseUrl, supabaseKey);
};
const supabase = safeSupabase();

// --- DONNÉES ---
const JOB_BOARDS = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/', color: 'bg-[#0077b5]' },
  { name: 'HelloWork', url: 'https://www.hellowork.com/', color: 'bg-[#ff0000]' },
  { name: 'Welcome to the Jungle', url: 'https://www.welcometothejungle.com/', color: 'bg-[#ffcd00] text-black' },
  { name: 'Indeed', url: 'https://fr.indeed.com/', color: 'bg-[#2164f3]' },
  { name: 'AFI24', url: 'https://www.afi24.org/', color: 'bg-purple-700' },
  { name: 'APEC', url: 'https://www.apec.fr/', color: 'bg-[#0f1f41]' },
  { name: 'JobTeaser', url: 'https://cytech.jobteaser.com/', color: 'bg-[#00ab65]' },
  { name: 'MyJobGlasses', url: 'https://www.myjobglasses.com/', color: 'bg-pink-600' },
  { name: 'Data Alumni', url: 'https://cytech.datalumni.com/', color: 'bg-cyan-600' },
];

// --- COMPOSANT ROUTINE QUOTIDIENNE ---
const DailyRoutine = () => {
  const [checks, setChecks] = useState({});
  const today = new Date().toLocaleDateString('fr-FR');

  useEffect(() => {
    // Charger la routine depuis le navigateur
    const saved = JSON.parse(localStorage.getItem('dailyRoutine') || '{}');
    if (saved.date !== today) {
      // Si c'est un nouveau jour, on reset tout !
      setChecks({});
      localStorage.setItem('dailyRoutine', JSON.stringify({ date: today, checks: {} }));
    } else {
      setChecks(saved.checks || {});
    }
  }, [today]);

  const toggleCheck = (siteName) => {
    const newChecks = { ...checks, [siteName]: !checks[siteName] };
    setChecks(newChecks);
    localStorage.setItem('dailyRoutine', JSON.stringify({ date: today, checks: newChecks }));
  };

  const progress = Math.round((Object.values(checks).filter(Boolean).length / JOB_BOARDS.length) * 100);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold flex items-center gap-2 text-gray-800">
            <RefreshCw size={18} className={progress === 100 ? "text-green-500" : "text-blue-600"}/> 
            Routine Quotidienne <span className="text-xs font-normal text-gray-400">({today})</span>
        </h3>
        <div className="text-xs font-bold text-gray-500">{progress}% fait</div>
      </div>
      
      {/* Barre de progression */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div className={`h-2 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
      </div>

      <div className="flex flex-wrap gap-2">
        {JOB_BOARDS.map(site => (
          <button 
            key={site.name}
            onClick={() => toggleCheck(site.name)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${checks[site.name] ? 'bg-green-50 border-green-200 text-green-700 opacity-60' : 'bg-white border-gray-200 hover:border-blue-300 text-gray-700'}`}
          >
            {checks[site.name] ? <CheckCircle size={14}/> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300"></div>}
            {site.name}
            <a href={site.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="ml-1 text-gray-400 hover:text-blue-600"><ExternalLink size={10}/></a>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- ECRAN DE CONNEXION ---
const AuthScreen = ({ supabase }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return alert("Erreur clés API");
    setLoading(true); setMessage('');
    try {
      const { error } = isSignUp ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (isSignUp) { setMessage('Compte créé ! Connecte-toi.'); setIsSignUp(false); }
    } catch (error) { setMessage(error.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
        {/* LOGO PLACEHOLDER */}
        <img src="/logo.png" onError={(e) => e.target.style.display='none'} alt="Logo" className="w-20 h-20 mx-auto mb-4 rounded-xl object-contain"/>
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Suivi Alternance</h1>
        <p className="text-gray-500 text-sm mb-6">{isSignUp ? "Créer un compte" : "Connexion à ton espace"}</p>
        <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Mot de passe" className="w-full px-4 py-2 border rounded-lg" value={password} onChange={e => setPassword(e.target.value)} required />
            <button disabled={loading} className="w-full bg-[#005792] hover:bg-[#004270] text-white font-bold py-2 rounded-lg transition-colors">{loading ? '...' : (isSignUp ? "S'inscrire" : "Se connecter")}</button>
        </form>
        {message && <div className="mt-4 p-2 bg-yellow-50 text-yellow-700 text-sm rounded">{message}</div>}
        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 text-sm text-blue-600 hover:underline">{isSignUp ? "J'ai déjà un compte" : "Créer un compte"}</button>
      </div>
    </div>
  );
};

// --- APP PRINCIPALE ---
const App = () => {
  const [session, setSession] = useState(null);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("date"); // 'date' ou 'alpha'
  const [viewMode, setViewMode] = useState("list"); 
  const [editingId, setEditingId] = useState(null);
  const [fileLM, setFileLM] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newApp, setNewApp] = useState({ company: "", role: "", status: "A faire", location: "", source: "LinkedIn", contact_email: "", date: new Date().toISOString().split('T')[0], lm_url: "" });

  const statusOptions = ["A faire", "Postulé", "Entretien", "Accepté", "Refusé"];

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); if (session) fetchData(); else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session); if (session) fetchData(); else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: apps } = await supabase.from('applications').select('*');
      setApplications(apps || []);
      const { data: prof } = await supabase.from('profile').select('*').limit(1).maybeSingle();
      if (prof) {
        setProfile(prof);
      } else { 
        // ICI C'ETAIT L'ERREUR, J'AI REMPLACÉ 'new' par 'newProf'
        const { data: newProf } = await supabase.from('profile').insert([{}]).select().single(); 
        if(newProf) setProfile(newProf); 
      }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { error } = await supabase.storage.from('documents').upload(fileName, file);
    if (error) { alert("Erreur upload"); return null; }
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
    resetForm();
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ?")) {
      await supabase.from('applications').delete().eq('id', id);
      setApplications(prev => prev.filter(a => a.id !== id));
    }
  };

  const resetForm = () => { setNewApp({ company: "", role: "", status: "A faire", location: "", source: "LinkedIn", contact_email: "", date: new Date().toISOString().split('T')[0], lm_url: "" }); setFileLM(null); setEditingId(null); };
  const calculateRelance = (d) => { if (!d) return "-"; const date = new Date(d); date.setDate(date.getDate() + 15); return date.toLocaleDateString('fr-FR'); };

  // --- TRI ET FILTRE ---
  const filteredApps = applications
    .filter(a => a.company?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortType === 'alpha') return a.company.localeCompare(b.company);
      return new Date(b.date) - new Date(a.date); // Par défaut : date décroissante
    });

  if (!supabase) return <div className="p-10 text-red-600 text-center">Clés manquantes</div>;
  if (!session) return <AuthScreen supabase={supabase} />;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans flex flex-col">
      <div className="max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6 flex-1">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             {/* LOGO PETIT DANS L'ENTETE */}
             <img src="/logo.png" onError={(e) => e.target.style.display='none'} className="w-10 h-10 rounded-lg object-contain bg-gray-50" alt="Logo"/>
             <h1 className="font-bold text-xl text-[#0f1f41] hidden md:block">Suivi Alternance</h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs text-gray-400 hidden sm:block">{session.user.email}</span>
             <button onClick={() => {supabase.auth.signOut(); setSession(null);}} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><LogOut size={20}/></button>
          </div>
        </div>

        {/* 1. ROUTINE QUOTIDIENNE (Checklist) */}
        <DailyRoutine />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GAUCHE : CVS & FORMULAIRE */}
          <div className="space-y-6">
            
            {/* BOUTONS UPLOAD AMÉLIORÉS */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
               <h2 className="font-bold flex items-center gap-2 mb-4 text-[#0f1f41]"><FileCheck className="text-[#005792]"/> Mes Documents</h2>
               <div className="space-y-3">
                  {/* CV ATS */}
                  <div className="relative group">
                    <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${profile?.cv_ats ? 'border-[#00ab65] bg-green-50' : 'border-dashed border-gray-300 hover:border-[#005792] hover:bg-blue-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${profile?.cv_ats ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}><FileText size={18}/></div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-700">CV ATS (Robot)</span>
                          <span className="text-[10px] text-gray-400">{profile?.cv_ats ? "Fichier chargé" : "PDF uniquement"}</span>
                        </div>
                      </div>
                      {uploading ? <span className="text-xs">...</span> : <Upload size={16} className="text-gray-400 group-hover:text-[#005792]"/>}
                      <input type="file" className="hidden" onChange={(e) => handleProfileUpload(e.target.files[0], 'ats')} disabled={uploading}/>
                    </label>
                    {profile?.cv_ats && <a href={profile.cv_ats} target="_blank" rel="noreferrer" className="absolute right-12 top-4 text-xs font-bold text-[#00ab65] hover:underline z-10">Voir</a>}
                  </div>

                  {/* CV HUMAIN */}
                  <div className="relative group">
                    <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${profile?.cv_human ? 'border-[#005792] bg-blue-50' : 'border-dashed border-gray-300 hover:border-[#fdbb2d] hover:bg-yellow-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${profile?.cv_human ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}><User size={18}/></div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-700">CV Design (Humain)</span>
                          <span className="text-[10px] text-gray-400">{profile?.cv_human ? "Fichier chargé" : "PDF uniquement"}</span>
                        </div>
                      </div>
                      {uploading ? <span className="text-xs">...</span> : <Upload size={16} className="text-gray-400 group-hover:text-[#005792]"/>}
                      <input type="file" className="hidden" onChange={(e) => handleProfileUpload(e.target.files[0], 'human')} disabled={uploading}/>
                    </label>
                    {profile?.cv_human && <a href={profile.cv_human} target="_blank" rel="noreferrer" className="absolute right-12 top-4 text-xs font-bold text-[#005792] hover:underline z-10">Voir</a>}
                  </div>
               </div>
            </div>

            {/* FORMULAIRE */}
            <div className={`bg-white p-5 rounded-xl shadow-sm border border-gray-200 ${editingId ? 'ring-2 ring-orange-200' : ''}`}>
               <div className="flex justify-between items-center mb-4">
                 <h2 className="font-bold text-[#0f1f41]">{editingId ? "Modifier" : "Nouvelle Candidature"}</h2>
                 {editingId && <button onClick={resetForm}><X size={16}/></button>}
               </div>
               <form onSubmit={handleSubmit} className="space-y-3">
                  <input placeholder="Entreprise (ex: Thales)" className="w-full border p-2 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" value={newApp.company} onChange={e=>setNewApp({...newApp, company: e.target.value})} required/>
                  <input placeholder="Poste (ex: Data Analyst)" className="w-full border p-2 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors" value={newApp.role} onChange={e=>setNewApp({...newApp, role: e.target.value})} required/>
                  <div className="grid grid-cols-2 gap-3">
                    <select className="border p-2 rounded-lg text-sm bg-gray-50" value={newApp.source} onChange={e=>setNewApp({...newApp, source: e.target.value})}>{JOB_BOARDS.map(j=><option key={j.name} value={j.name}>{j.name}</option>)}<option value="Autre">Autre</option></select>
                    <select className="border p-2 rounded-lg text-sm bg-gray-50" value={newApp.status} onChange={e=>setNewApp({...newApp, status: e.target.value})}>{statusOptions.map(s=><option key={s} value={s}>{s}</option>)}</select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <input type="date" className="border p-2 rounded-lg text-sm bg-gray-50" value={newApp.date} onChange={e=>setNewApp({...newApp, date: e.target.value})} required />
                     <input placeholder="Lieu" className="border p-2 rounded-lg text-sm bg-gray-50" value={newApp.location} onChange={e=>setNewApp({...newApp, location: e.target.value})} />
                  </div>
                  
                  {/* UPLOAD LM */}
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-dashed border-gray-300 p-2 rounded-lg text-xs text-gray-500 hover:bg-gray-100">
                     <FileText size={14}/> {newApp.lm_url ? "Lettre jointe (Changer)" : "Joindre Lettre de motiv'"}
                     <input type="file" className="hidden" onChange={(e) => setFileLM(e.target.files[0])} />
                  </label>
                  
                  <button disabled={uploading} className={`w-full py-2.5 rounded-lg text-white font-bold text-sm shadow-md transition-transform active:scale-95 ${editingId ? 'bg-orange-500' : 'bg-[#005792] hover:bg-[#004270]'}`}>
                    {uploading ? "..." : (editingId ? "Sauvegarder" : "Ajouter la candidature")}
                  </button>
               </form>
            </div>
          </div>

          {/* DROITE : LISTE / KANBAN */}
          <div className="lg:col-span-2 space-y-4">
             {/* BARRE DE RECHERCHE & TRI */}
             <div className="flex flex-wrap gap-3 items-center">
                <div className="flex bg-white rounded-lg border p-1">
                   <button onClick={()=>setViewMode('list')} className={`p-2 rounded ${viewMode==='list'?'bg-gray-100 text-blue-600':'text-gray-400'}`}><List size={18}/></button>
                   <button onClick={()=>setViewMode('kanban')} className={`p-2 rounded ${viewMode==='kanban'?'bg-gray-100 text-blue-600':'text-gray-400'}`}><LayoutGrid size={18}/></button>
                </div>
                <div className="flex-1 relative">
                   <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                   <input placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
                </div>
                {/* MENU DEROULANT TRI */}
                <select value={sortType} onChange={(e) => setSortType(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white cursor-pointer">
                    <option value="date">📅 Date (Récent)</option>
                    <option value="alpha">🔤 Alphabétique</option>
                </select>
             </div>

             {/* VUE */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                {viewMode === 'list' ? (
                   <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                       <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b">
                         <tr>
                           <th className="p-4">Entreprise</th>
                           <th className="p-4">Poste</th>
                           <th className="p-4">Statut</th>
                           <th className="p-4">Postulé le</th>
                           <th className="p-4">Relance (J+15)</th>
                           <th className="p-4 text-right">Action</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y">
                         {filteredApps.map(app => (
                           <tr key={app.id} className="hover:bg-gray-50 group">
                              <td className="p-4 font-bold text-[#0f1f41]">{app.company}</td>
                              <td className="p-4 text-gray-600">{app.role}</td>
                              <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${app.status==='Postulé'?'bg-blue-50 border-blue-200 text-blue-700':app.status==='Refusé'?'bg-red-50 border-red-200 text-red-700':app.status==='Accepté'?'bg-green-50 border-green-200 text-green-700':'bg-gray-50 border-gray-200'}`}>{app.status}</span></td>
                              <td className="p-4 text-gray-500">{new Date(app.date).toLocaleDateString('fr-FR')}</td>
                              <td className="p-4 text-orange-600 font-medium text-xs flex items-center gap-1"><Calendar size={12}/> {calculateRelance(app.date)}</td>
                              <td className="p-4 text-right">
                                 <button onClick={()=>handleDelete(app.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                 <button onClick={()=>{setNewApp(app); setEditingId(app.id);}} className="text-gray-300 hover:text-blue-500 p-1"><Pencil size={16}/></button>
                              </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                     {filteredApps.length === 0 && <div className="p-10 text-center text-gray-400">Aucune candidature</div>}
                   </div>
                ) : (
                   <div className="flex gap-4 p-4 overflow-x-auto h-full items-start">
                      {statusOptions.map(status => (
                        <div key={status} className="min-w-[260px] bg-gray-50 rounded-xl p-3 border border-gray-200">
                           <h3 className="font-bold text-xs uppercase text-gray-500 mb-3 flex justify-between">{status} <span className="bg-white border px-1.5 rounded text-gray-400">{filteredApps.filter(a=>a.status===status).length}</span></h3>
                           <div className="flex flex-col gap-2">
                             {filteredApps.filter(a=>a.status===status).map(app => (
                               <div key={app.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={()=>{setNewApp(app); setEditingId(app.id);}}>
                                  <div className="flex justify-between items-start">
                                    <div className="font-bold text-[#0f1f41]">{app.company}</div>
                                    {app.lm_url && <FileText size={12} className="text-blue-400"/>}
                                  </div>
                                  <div className="text-xs text-gray-500 mb-2">{app.role}</div>
                                  <div className="text-[10px] text-gray-400 bg-gray-50 inline-block px-1.5 py-0.5 rounded">Postulé le {new Date(app.date).toLocaleDateString()}</div>
                               </div>
                             ))}
                           </div>
                        </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
      
      {/* FOOTER */}
      <footer className="bg-white border-t p-6 text-center text-sm text-gray-400">
        <p>© 2026 - Développé avec <Heart size={10} className="inline text-red-400"/> par Sheryne OUARGHI-MHIRI / sheryne.ouarghi.pro@gmail.com</p>
      </footer>
    </div>
  );
};

export default App;