import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckSquare, 
  Search, Pencil, X, Mail, AlertTriangle, ExternalLink, FileText, 
  Upload, FileCheck, FileSpreadsheet, List, LogOut, User, Lock, Eye, EyeOff, Heart, LayoutGrid
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

// --- LISTE DES SITES (RESSOURCES) ---
const QUICK_LINKS = [
  { name: 'AFI24', url: 'https://www.afi24.org/', color: 'bg-purple-700' },
  { name: 'JobTeaser', url: 'https://cytech.jobteaser.com/', color: 'bg-green-600' },
  { name: 'Data Alumni', url: 'https://cytech.datalumni.com/', color: 'bg-cyan-600' },
  { name: 'APEC', url: 'https://www.apec.fr/', color: 'bg-indigo-700' },
  { name: 'Métierscope', url: 'https://candidat.francetravail.fr/metierscope/', color: 'bg-orange-500' },
  { name: 'WTTJ', url: 'https://www.welcometothejungle.com/', color: 'bg-yellow-400 text-black' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/', color: 'bg-blue-700' },
];

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
  // 1. STATES
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
  
  // État Formulaire (COMPLET)
  const [newApp, setNewApp] = useState({ 
    company: "", role: "", status: "A faire", location: "", source: "LinkedIn", 
    contact_email: "", date: new Date().toISOString().split('T')[0], relanceDone: false, lm_url: "" 
  });

  // Options
  const statusOptions = [
    { value: "A faire", label: "À faire", color: "bg-gray-100 text-gray-800 border-gray-200" },
    { value: "Postulé", label: "Postulé", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: "Entretien", label: "Entretien", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { value: "Accepté", label: "Accepté", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "Refusé", label: "Refusé", color: "bg-red-100 text-red-800 border-red-200" },
  ];
  const sourceOptions = ["LinkedIn", "JobTeaser", "Contact direct", "Site de l'entreprise", "Indeed", "Welcome to the Jungle", "Autre"];

  // 2. USE EFFECT (Auth + Data)
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

  // 3. FONCTIONS BACKEND
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
    if (!newApp.company || !newApp.role) return;
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

  const handleQuickChange = async (id, field, value) => {
    setApplications(applications.map(app => app.id === id ? { ...app, [field]: value } : app));
    await supabase.from('applications').update({ [field]: value }).eq('id', id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ?")) {
      await supabase.from('applications').delete().eq('id', id);
      setApplications(prev => prev.filter(a => a.id !== id));
    }
  };

  // 4. HELPERS
  const resetForm = () => { setNewApp({ company: "", role: "", status: "A faire", location: "", source: "LinkedIn", contact_email: "", date: new Date().toISOString().split('T')[0], relanceDone: false, lm_url: "" }); setFileLM(null); setEditingId(null); };
  
  const calculateRelanceDate = (d) => { 
      if (!d) return "-"; 
      const date = new Date(d); 
      date.setDate(date.getDate() + 15); // J+15
      return date.toLocaleDateString('fr-FR'); 
  };
  
  const getStatusStyle = (val) => statusOptions.find(o => o.value === val)?.color || "bg-gray-100";
  const normalizeString = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
  const duplicates = newApp.company ? applications.filter(app => normalizeString(app.company) === normalizeString(newApp.company) && app.id !== editingId) : [];
  
  const handleEditClick = (app) => { setNewApp(app); setEditingId(app.id); setFileLM(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  const exportToCSV = () => {
    const headers = ["Entreprise", "Poste", "Statut", "Contact", "Source", "Date", "Relance", "Lien LM"];
    const rows = applications.map(app => [`"${app.company}"`, `"${app.role}"`, `"${app.status}"`, `"${app.contact_email || app.location || ''}"`, `"${app.source}"`, `"${app.date}"`, `"${calculateRelanceDate(app.date)}"`, `"${app.lm_url || ''}"`]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a"); link.href = encodeURI(csvContent); link.download = "suivi_alternance.csv"; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const filteredApps = applications.filter(a => a.company?.toLowerCase().includes(searchTerm.toLowerCase()));

  // 5. RENDU CONDITIONNEL
  if (!supabase) return <div className="p-10 text-red-600 font-bold text-center">ERREUR : Clés Supabase manquantes dans App.js (lignes 12-13).</div>;
  if (loading && !session) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500">Chargement...</div>;
  if (!session) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-[98%] mx-auto space-y-6">
          
          {/* HEADER */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-lg">
            <div className="font-bold flex items-center gap-2 text-lg"><Briefcase/> Suivi Alternance</div>
            <div className="flex items-center gap-3">
               <span className="text-xs text-slate-400 hidden sm:block">{session.user.email}</span>
               <button onClick={handleLogout} className="bg-red-600 px-3 py-1.5 rounded text-xs hover:bg-red-700 flex items-center gap-1 font-bold transition-colors"><LogOut size={14}/> Sortir</button>
            </div>
          </div>

          {/* BARRE DE SITES (RESSOURCES) */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 overflow-x-auto flex gap-3 items-center">
              <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Ressources :</span>
              {QUICK_LINKS.map(link => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className={`${link.color} text-white px-3 py-1 rounded-md text-xs font-bold hover:opacity-90 whitespace-nowrap flex items-center gap-1 transition-transform hover:scale-105 shadow-sm`}>
                      {link.name} <ExternalLink size={10}/>
                  </a>
              ))}
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
                <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 ${viewMode==='kanban' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}><LayoutGrid size={16}/> Kanban</button>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <input placeholder="Rechercher une entreprise..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
                </div>
                <button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg flex items-center gap-1"><FileSpreadsheet size={18}/></button>
            </div>
          </div>

          {/* FORMULAIRE COMPLET RETROUVÉ */}
          <div className={`p-6 rounded-xl shadow-sm border ${editingId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold flex items-center gap-2">{editingId ? <><Pencil size={20} className="text-orange-600" /> Modifier</> : <><Plus size={20} className="text-blue-600" /> Ajouter</>}</h2>{editingId && <button onClick={resetForm} className="text-sm text-gray-500 flex items-center gap-1"><X size={16}/> Annuler</button>}</div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-3"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Entreprise</label><div className="relative"><Building2 className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" placeholder="Thales" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={newApp.company} onChange={(e)=>setNewApp({...newApp, company: e.target.value})} required /></div>{duplicates.length > 0 && (<div className="mt-2 text-xs text-orange-700 bg-orange-100 p-2 rounded-lg flex gap-2 animate-pulse"><AlertTriangle size={14}/> Déjà postulé !</div>)}</div>
              <div className="md:col-span-3"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Poste</label><div className="relative"><Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" placeholder="Développeur..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={newApp.role} onChange={(e)=>setNewApp({...newApp, role: e.target.value})} required /></div></div>
              <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Source</label><select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={newApp.source} onChange={(e)=>setNewApp({...newApp, source: e.target.value})}>{sourceOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}</select></div>
              <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Lieu / Contact</label><div className="relative"><MapPin className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" placeholder="Paris / RH" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={newApp.location} onChange={(e)=>setNewApp({...newApp, location: e.target.value})} /></div></div>
              <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date</label><input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={newApp.date} onChange={(e)=>setNewApp({...newApp, date: e.target.value})} required /></div>
              <div className="md:col-span-8 bg-gray-50 p-2 rounded-lg border border-dashed border-gray-300 flex items-center gap-4"><div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1"><FileText size={12}/> Lettre de Motivation (Optionnel)</label><input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFileLM(e.target.files[0])} className="w-full text-xs text-gray-500"/></div>{newApp.lm_url && <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded border border-green-200">✓ Fichier lié</div>}</div>
              <div className="md:col-span-4 flex justify-end items-end h-full"><button type="submit" disabled={uploading} className={`w-full py-2 text-white rounded-lg font-medium flex justify-center items-center gap-2 text-sm ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'} ${uploading ? 'opacity-50' : ''}`}>{uploading ? "Envoi..." : (editingId ? "Mettre à jour" : "Ajouter")}</button></div>
            </form>
          </div>

          {/* VUE LISTE COMPLETE */}
          {viewMode === 'list' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[1000px]">
                   <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs font-bold"><tr><th className="p-4">Entreprise</th><th className="p-4">Poste</th><th className="p-4">Statut</th><th className="p-4">Contact</th><th className="p-4">LM</th><th className="p-4">Relance (J+15)</th><th className="p-4 text-center">Fait</th><th className="p-4 text-right">Actions</th></tr></thead>
                   <tbody className="divide-y">
                      {filteredApps.map(app => (
                         <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-bold text-gray-800">{app.company}</td>
                            <td className="p-4 text-gray-600">{app.role}</td>
                            <td className="p-4"><select value={app.status} onChange={(e)=>handleQuickChange(app.id, 'status', e.target.value)} className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${getStatusStyle(app.status)}`}>{statusOptions.map(opt=><option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></td>
                            <td className="p-4">{app.contact_email ? <span className="text-blue-600 flex gap-1 items-center font-medium"><Mail size={12}/> {app.contact_email}</span> : <span className="text-gray-500 flex gap-1 items-center"><MapPin size={12}/> {app.location||"-"}</span>}</td>
                            <td className="p-4">{app.lm_url ? <a href={app.lm_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 bg-purple-50 p-1.5 rounded hover:bg-purple-100 inline-block"><FileText size={16}/></a> : <span className="text-gray-300">-</span>}</td>
                            <td className="p-4"><div className="text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit text-xs font-bold border border-orange-100 flex items-center gap-1"><Calendar size={12}/> {calculateRelanceDate(app.date)}</div></td>
                            <td className="p-4 text-center"><button onClick={()=>handleQuickChange(app.id, 'relanceDone', !app.relanceDone)} className={`p-1.5 rounded transition-colors ${app.relanceDone?'bg-green-100 text-green-600':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}><CheckSquare size={18} className={app.relanceDone?"fill-current":""}/></button></td>
                            <td className="p-4 text-right flex justify-end gap-2">
                               <button onClick={() => handleEditClick(app)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={18}/></button>
                               <button onClick={() => handleDelete(app.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                            </td>
                         </tr>
                      ))}
                      {filteredApps.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-gray-400 italic">Aucune candidature trouvée.</td></tr>}
                   </tbody>
                </table>
             </div>
          )}
          
          {/* VUE KANBAN */}
          {viewMode === 'kanban' && (
             <div className="flex gap-4 overflow-x-auto pb-6">
                {statusOptions.map(option => {
                   const columnApps = filteredApps.filter(a => a.status === option.value);
                   return (
                     <div key={option.value} className="min-w-[280px] w-80 bg-gray-100 p-4 rounded-xl flex flex-col gap-3 shrink-0 h-fit">
                        <h3 className={`font-bold text-xs uppercase px-2 py-1 rounded border bg-white flex justify-between ${option.color}`}>{option.label} <span>{columnApps.length}</span></h3>
                        {columnApps.map(app => (
                           <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative">
                              <div className="flex justify-between items-start mb-1"><div className="font-bold text-gray-800">{app.company}</div><button onClick={() => handleDelete(app.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button></div>
                              <div className="text-xs text-gray-500 mb-2">{app.role}</div>
                              <div className="flex justify-between items-end mt-2">
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={10}/> {calculateRelanceDate(app.date)}</span>
                                    <div className="flex gap-1">{app.lm_url && <a href={app.lm_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 bg-purple-50 p-1 rounded"><FileText size={12}/></a>}<button onClick={() => handleEditClick(app)} className="text-blue-500 bg-blue-50 p-1 rounded"><Pencil size={12}/></button></div>
                                 </div>
                                 <select value={app.status} onChange={(e)=>handleQuickChange(app.id, 'status', e.target.value)} className="text-[10px] border rounded bg-gray-50 px-1 py-0.5 max-w-[80px]">{statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                              </div>
                           </div>
                        ))}
                     </div>
                   );
                })}
             </div>
          )}
        </div>
      </div>
      
      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 p-6 text-center text-sm text-gray-500 mt-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <p>© {new Date().getFullYear()} - Développé par <strong>TON NOM ET PRÉNOM</strong> - Tous droits réservés.</p>
            <span className="hidden md:block">•</span>
            <p className="flex items-center gap-2">Contact : <a href="mailto:TON.EMAIL@PRO.COM" className="text-blue-600 hover:underline font-medium">TON.EMAIL@PRO.COM</a></p>
        </div>
        <div className="mt-2 text-xs text-gray-400 flex items-center justify-center gap-1">Fait avec <Heart size={10} className="text-red-400 fill-current"/> pour l'alternance</div>
      </footer>
    </div>
  );
};

export default App;