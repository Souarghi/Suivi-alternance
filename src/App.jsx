import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckSquare, 
  Search, Pencil, X, Mail, AlertTriangle, ExternalLink, FileText, 
  Upload, FileCheck, List, LogOut, User, Lock, LayoutGrid,
  CheckCircle, RefreshCw, AlertOctagon, Heart, ShieldCheck, Download, Link as LinkIcon, Star, Check
} from 'lucide-react';

// --- CONFIGURATION SUPABASE ---
const supabaseUrl = 'https://mvloohmnvggirpdfhotb.supabase.co';
const supabaseKey = 'sb_publishable_fAGf692lpXVGI1YZgyx3Ew_Dz_tEEYO';

const safeSupabase = () => {
  if (!supabaseUrl || supabaseUrl.includes('TON_URL')) return null;
  return createClient(supabaseUrl, supabaseKey);
};
const supabase = safeSupabase();

// --- DONNÉES GLOBALES ---
const JOB_BOARDS = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/', color: 'text-[#0077b5] border-[#0077b5] hover:bg-[#0077b5] hover:text-white' },
  { name: 'HelloWork', url: 'https://www.hellowork.com/', color: 'text-[#ff0000] border-[#ff0000] hover:bg-[#ff0000] hover:text-white' },
  { name: 'WTTJ', url: 'https://www.welcometothejungle.com/', color: 'text-[#ffcd00] border-[#ffcd00] hover:bg-[#ffcd00] hover:text-black' },
  { name: 'Indeed', url: 'https://fr.indeed.com/', color: 'text-[#2164f3] border-[#2164f3] hover:bg-[#2164f3] hover:text-white' },
  { name: 'AFI24', url: 'https://www.afi24.org/', color: 'text-purple-700 border-purple-700 hover:bg-purple-700 hover:text-white' },
  { name: 'APEC', url: 'https://www.apec.fr/', color: 'text-[#0f1f41] border-[#0f1f41] hover:bg-[#0f1f41] hover:text-white' },
  { name: 'JobTeaser', url: 'https://cytech.jobteaser.com/', color: 'text-[#00ab65] border-[#00ab65] hover:bg-[#00ab65] hover:text-white' },
  { name: 'MyJobGlasses', url: 'https://www.myjobglasses.com/', color: 'text-pink-600 border-pink-600 hover:bg-pink-600 hover:text-white' },
];

const STATUS_OPTIONS = ["A faire", "Postulé", "Entretien", "Accepté", "Refusé"];
const SOURCE_OPTIONS = ["LinkedIn", "Indeed", "HelloWork", "WTTJ", "JobTeaser", "Contact direct", "Site Entreprise", "Autre"];

// --- COMPOSANT : ROUTINE DU MATIN ---
const DailyRoutine = () => {
  const [checks, setChecks] = useState({});
  const today = new Date().toLocaleDateString('fr-FR');
  
  useEffect(() => { 
      const saved = JSON.parse(localStorage.getItem('dailyRoutine') || '{}'); 
      if (saved.date === today) setChecks(saved.checks || {});
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
        <h3 className="font-bold flex items-center gap-2 text-gray-800"><RefreshCw size={18} className="text-blue-600"/> Routine du Matin</h3>
        <div className="text-xs font-bold text-gray-500">{progress}%</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {JOB_BOARDS.map(site => (
          <button key={site.name} onClick={() => toggleCheck(site.name)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${checks[site.name] ? 'bg-gray-100 border-gray-300 text-gray-400 grayscale' : `bg-white ${site.color}`}`}>
            {checks[site.name] ? <CheckCircle size={14}/> : <div className="w-3.5 h-3.5 rounded-full border border-current"></div>}
            {site.name}
            <a href={site.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="ml-1 opacity-70 hover:opacity-100 hover:scale-110 transition-transform">
                <ExternalLink size={10}/>
            </a>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- COMPOSANT : MODAL RGPD ---
const LegalModal = ({ onClose, onExport, onDeleteAccount, isAuthScreen }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-[#0f1f41] flex items-center gap-2"><ShieldCheck className="text-blue-600"/> Données & Confidentialité (RGPD)</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={24}/></button>
      </div>
      <div className="space-y-6 text-sm text-gray-700">
        <section>
            <h3 className="font-bold text-lg mb-2 text-gray-900">1. Présentation & Objectif</h3>
            <p><strong>Suivi Alternance</strong> est une application développée par <strong>Sheryne OUARGHI-MHIRI</strong>.</p>
        </section>
        <section>
            <h3 className="font-bold text-lg mb-2 text-gray-900">2. Vos Droits (RGPD)</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Droit à l'oubli :</strong> Suppression totale possible à tout moment.</li>
                <li><strong>Portabilité :</strong> Export CSV disponible.</li>
            </ul>
        </section>
        {!isAuthScreen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Download size={16}/> Portabilité</h3>
                    <button onClick={onExport} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 text-xs w-full">Télécharger (.csv)</button>
                </section>
                <section className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2"><Trash2 size={16}/> Zone de Danger</h3>
                    <button onClick={() => { if(window.confirm("Tout sera effacé définitivement ?")) onDeleteAccount(); }} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 text-xs w-full">Supprimer mon compte</button>
                </section>
            </div>
        )}
      </div>
    </div>
  </div>
);

// --- COMPOSANT : ECRAN D'AUTHENTIFICATION ---
const AuthScreen = ({ supabase }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showLegal, setShowLegal] = useState(false);

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
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      <div className="md:w-1/2 bg-[#0f1f41] text-white p-8 md:p-12 flex flex-col justify-between">
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2">
                    <img src="/logo.png" onError={(e) => {e.target.style.display='none';}} alt="Logo" className="w-full h-full object-contain"/>
                    <Briefcase className="text-[#0f1f41] absolute opacity-0" size={24}/>
                </div>
                <span className="text-2xl font-bold tracking-tight">Suivi Alternance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">Ne perdez plus le fil de vos <span className="text-[#4dabf7]">candidatures</span>.</h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">Centralisez, relancez, décrochez votre alternance.</p>
        </div>
        <div className="mt-12 md:mt-0 pt-6 border-t border-gray-700">
            <button onClick={() => setShowLegal(true)} className="text-sm text-gray-400 hover:text-white underline transition-colors">Mentions Légales & RGPD</button>
        </div>
      </div>
      <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{isSignUp ? "Créer un compte" : "Bon retour !"}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label><input type="email" className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mot de passe</label><input type="password" className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={e => setPassword(e.target.value)} required /></div>
                <button disabled={loading} className="w-full bg-[#005792] hover:bg-[#004270] text-white font-bold py-3 rounded-lg transition-all">{loading ? 'Chargement...' : (isSignUp ? "S'inscrire" : "Se connecter")}</button>
            </form>
            <div className="mt-6 text-center pt-4"><button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-[#005792] font-bold hover:underline">{isSignUp ? "Déjà un compte ? Connexion" : "Créer un compte gratuitement"}</button></div>
        </div>
      </div>
      {showLegal && <LegalModal onClose={() => setShowLegal(false)} isAuthScreen={true} />}
    </div>
  );
};

// --- COMPOSANT PRINCIPAL : APP ---
const App = () => {
  const [session, setSession] = useState(null);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLegal, setShowLegal] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("date_desc"); 
  const [viewMode, setViewMode] = useState("list"); 
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const formRef = useRef(null);

  const [newApp, setNewApp] = useState({ 
    company: "", role: "", status: "A faire", location: "", source: "LinkedIn", 
    contact_email: "", application_url: "", date: new Date().toISOString().split('T')[0], relanceDone: false, isFavorite: false
  });

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
      if (prof) setProfile(prof);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  // --- LOGIQUE ANTI-DOUBLON ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Normalisation pour comparer "Thales", "thalès", "THALES"
    const normalize = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
    const cleanCompany = normalize(newApp.company);

    // Vérification
    const isDuplicate = applications.some(app => 
        app.id !== editingId && // On ne compare pas avec soi-même si on édite
        normalize(app.company) === cleanCompany
    );

    if (isDuplicate) {
        if (!window.confirm(`⚠️ Attention : Vous avez déjà une candidature pour "${newApp.company}". Voulez-vous quand même l'ajouter ?`)) {
            return; // On annule si l'utilisateur dit Non
        }
    }

    setUploading(true);
    if (editingId) {
      await supabase.from('applications').update(newApp).eq('id', editingId);
      setApplications(prev => prev.map(a => a.id === editingId ? { ...a, ...newApp } : a));
    } else {
      const { data } = await supabase.from('applications').insert([newApp]).select();
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

  const toggleRelance = async (app) => {
    const newVal = !app.relanceDone;
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, relanceDone: newVal } : a));
    await supabase.from('applications').update({ relanceDone: newVal }).eq('id', app.id);
  };

  const toggleFavorite = async (app) => {
    const newVal = !app.isFavorite;
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, isFavorite: newVal } : a));
    await supabase.from('applications').update({ isFavorite: newVal }).eq('id', app.id);
  };

  const handleEdit = (app) => {
      setNewApp(app);
      setEditingId(app.id);
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => { 
    setNewApp({ company: "", role: "", status: "A faire", location: "", source: "LinkedIn", contact_email: "", application_url: "", date: new Date().toISOString().split('T')[0], relanceDone: false, isFavorite: false }); 
    setEditingId(null); 
  };

  const calculateRelance = (d) => { 
    if (!d) return "-"; 
    const date = new Date(d); 
    date.setDate(date.getDate() + 15); 
    return date.toLocaleDateString('fr-FR'); 
  };

  // --- PRÉPARATION AUTO-COMPLÉTION ---
  const uniqueCompanies = [...new Set(applications.map(a => a.company).filter(Boolean))].sort();
  const uniqueLocations = [...new Set(applications.map(a => a.location).filter(Boolean))].sort();

  const filteredApps = applications
    .filter(a => a.company?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
        if (sortType === 'source') return (a.source || "").localeCompare(b.source || ""); 
        if (sortType === 'favorite') return (b.isFavorite === true) - (a.isFavorite === true);
        if (sortType === 'alpha') return a.company.localeCompare(b.company);
        if (sortType === 'date_asc') return new Date(a.date) - new Date(b.date);
        return new Date(b.date) - new Date(a.date);
    });

  if (!session) return <AuthScreen supabase={supabase} />;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans flex flex-col">
      <div className="max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6 flex-1">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             {/* LOGO AVEC FALLBACK */}
             <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden relative">
                <img src="/logo.png" onError={(e) => {e.target.style.display='none';}} className="w-full h-full object-contain z-10" alt="Logo"/>
                <Briefcase size={20} className="text-blue-500 absolute opacity-50"/>
             </div>
             <h1 className="font-bold text-xl text-[#0f1f41]">Suivi Alternance</h1>
          </div>
          <button onClick={() => {supabase.auth.signOut(); setSession(null);}} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><LogOut size={20}/></button>
        </div>

        {/* ROUTINE */}
        <DailyRoutine />

        {/* FORMULAIRE EN HAUT */}
        <div ref={formRef} className={`bg-white p-6 rounded-xl shadow-sm border-2 transition-all ${editingId ? 'border-orange-400 bg-orange-50/30' : 'border-transparent'}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-extrabold text-[#0f1f41] flex items-center gap-2 text-lg">
                    {editingId ? <Pencil className="text-orange-500"/> : <Plus className="text-blue-600"/>}
                    {editingId ? "Modifier la candidature" : "Nouvelle candidature"}
                </h2>
                {editingId && <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>}
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* LISTES POUR AUTO-COMPLETION */}
                <datalist id="companies-list">
                    {uniqueCompanies.map(c => <option key={c} value={c}/>)}
                </datalist>
                <datalist id="locations-list">
                    {uniqueLocations.map(l => <option key={l} value={l}/>)}
                </datalist>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Entreprise</label>
                    <input list="companies-list" placeholder="Ex: Thales, Google..." className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={newApp.company} onChange={e=>setNewApp({...newApp, company: e.target.value})} required/>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Poste</label>
                    <input placeholder="Ex: Data Analyst" className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={newApp.role} onChange={e=>setNewApp({...newApp, role: e.target.value})} required/>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Plateforme / Source</label>
                    <select className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none" value={newApp.source} onChange={e=>setNewApp({...newApp, source: e.target.value})}>
                        {SOURCE_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Statut actuel</label>
                    <select className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none" value={newApp.status} onChange={e=>setNewApp({...newApp, status: e.target.value})}>
                        {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Date de candidature</label>
                    <input type="date" className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={newApp.date} onChange={e=>setNewApp({...newApp, date: e.target.value})} required />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Ville</label>
                    <input list="locations-list" placeholder="Ex: Paris, Lyon..." className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={newApp.location} onChange={e=>setNewApp({...newApp, location: e.target.value})} />
                </div>
                <div className="lg:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Lien de l'annonce ou Email</label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-3 text-gray-400" size={14}/>
                        <input placeholder="URL de l'offre ou email de contact" className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={newApp.application_url || newApp.contact_email} onChange={e=>setNewApp({...newApp, application_url: e.target.value, contact_email: e.target.value})} />
                    </div>
                </div>

                <button disabled={uploading} className={`lg:col-span-4 py-3 rounded-lg text-white font-bold text-sm shadow-md transition-all active:scale-95 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#005792] hover:bg-[#004270]'}`}>
                    {uploading ? "Chargement..." : (editingId ? "Mettre à jour la candidature" : "Ajouter au tableau")}
                </button>
            </form>
        </div>

        {/* TABLEAU ET FILTRES */}
        <div className="space-y-4">
             <div className="flex flex-wrap gap-3 items-center">
                <div className="flex bg-white rounded-lg border p-1 shadow-sm">
                   <button onClick={()=>setViewMode('list')} className={`p-2 rounded ${viewMode==='list'?'bg-blue-50 text-blue-600':'text-gray-400'}`}><List size={18}/></button>
                   <button onClick={()=>setViewMode('kanban')} className={`p-2 rounded ${viewMode==='kanban'?'bg-blue-50 text-blue-600':'text-gray-400'}`}><LayoutGrid size={18}/></button>
                </div>
                <div className="flex-1 min-w-[200px] relative">
                   <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                   <input placeholder="Rechercher une entreprise..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
                </div>
                <select value={sortType} onChange={(e) => setSortType(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm cursor-pointer outline-none">
                    <option value="date_desc">📅 Plus récent</option>
                    <option value="date_asc">📅 Plus ancien</option>
                    <option value="source">🌐 Par Plateforme</option>
                    <option value="favorite">❤️ Favoris</option>
                    <option value="alpha">🔤 Alphabétique</option>
                </select>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {viewMode === 'list' ? (
                   <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                       <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b">
                         <tr>
                            <th className="p-4 w-10"></th>
                            <th className="p-4">Entreprise</th>
                            <th className="p-4">Poste</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Source</th>
                            <th className="p-4">Lien / Contact</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4 text-center">Relance</th>
                            <th className="p-4 text-right">Action</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y">
                         {filteredApps.map(app => (
                           <tr key={app.id} className="hover:bg-gray-50/80 group transition-colors">
                              <td className="p-4"><button onClick={()=>toggleFavorite(app)}><Heart size={18} className={app.isFavorite ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-300"}/></button></td>
                              <td className="p-4">
                                <div className="font-bold text-[#0f1f41]">{app.company}</div>
                                <div className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin size={8}/>{app.location || "N/A"}</div>
                              </td>
                              <td className="p-4 text-gray-600 font-medium">{app.role}</td>
                              <td className="p-4 text-gray-500 text-xs">{new Date(app.date).toLocaleDateString('fr-FR')}</td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold border border-gray-200">{app.source}</span>
                              </td>
                              
                              <td className="p-4">
                                {app.source === 'Contact direct' ? (
                                    app.contact_email ? <a href={`mailto:${app.contact_email}`} className="text-blue-500 hover:underline flex items-center gap-1 text-[10px]"><Mail size={12}/> {app.contact_email}</a> : <span className="text-gray-300 text-xs">-</span>
                                ) : (
                                    app.application_url ? <a href={app.application_url} target="_blank" rel="noreferrer" className="text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1 w-fit hover:bg-blue-100 text-[10px] font-bold border border-blue-100 transition-colors"><ExternalLink size={12}/> Voir l'annonce</a> : <span className="text-gray-300 text-xs">-</span>
                                )}
                              </td>

                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                                    app.status==='Postulé' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                                    app.status==='Refusé' ? 'bg-red-50 border-red-200 text-red-700' : 
                                    app.status==='Accepté' ? 'bg-green-50 border-green-200 text-green-700' : 
                                    'bg-gray-50 border-gray-200'}`}>{app.status}</span>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex flex-col items-center gap-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${app.relanceDone ? 'bg-green-100 text-green-700 opacity-50' : 'bg-orange-50 text-orange-600'}`}>{calculateRelance(app.date)}</span>
                                    <input type="checkbox" checked={app.relanceDone || false} onChange={() => toggleRelance(app)} className="w-4 h-4 cursor-pointer accent-green-600"/>
                                </div>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button onClick={()=>handleEdit(app)} className="text-gray-300 hover:text-blue-500 transition-colors"><Pencil size={16}/></button>
                                <button onClick={()=>handleDelete(app.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                              </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                     {filteredApps.length === 0 && <div className="p-20 text-center text-gray-400 flex flex-col items-center gap-2"><Search size={40} className="opacity-20"/><p>Aucune candidature trouvée</p></div>}
                   </div>
                ) : (
                   <div className="flex gap-4 p-4 overflow-x-auto h-full items-start bg-gray-50/50">
                      {STATUS_OPTIONS.map(status => (
                        <div key={status} className="min-w-[280px] bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                           <h3 className="font-bold text-xs uppercase text-gray-400 mb-4 flex justify-between px-1">{status} <span className="bg-gray-100 px-1.5 rounded text-gray-500">{filteredApps.filter(a=>a.status===status).length}</span></h3>
                           <div className="flex flex-col gap-3">
                             {filteredApps.filter(a=>a.status===status).map(app => (
                               <div key={app.id} className={`p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white relative group ${app.relanceDone ? 'bg-gray-50/50' : ''}`} onClick={()=>handleEdit(app)}>
                                  <div className="flex justify-between items-start mb-1">
                                      <div className="font-bold text-[#0f1f41] text-sm leading-tight">{app.company}</div>
                                      <button onClick={(e)=>{e.stopPropagation(); toggleFavorite(app);}}><Heart size={14} className={app.isFavorite ? "fill-red-500 text-red-500" : "text-gray-200"}/></button>
                                  </div>
                                  <div className="text-[11px] text-gray-500 mb-3">{app.role}</div>
                                  <div className="flex justify-between items-center border-t pt-2 mt-2">
                                    <div className="text-[9px] font-bold text-gray-400 uppercase">{app.source}</div>
                                    <div className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{calculateRelance(app.date)}</div>
                                  </div>
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
      
      {/* FOOTER */}
      <footer className="bg-white border-t p-6 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
        <p>© 2026 - Développé par Sheryne OUARGHI-MHIRI</p>
        <button onClick={() => setShowLegal(true)} className="hover:underline">Mentions Légales & RGPD</button>
      </footer>

      {/* MODAL */}
      {showLegal && <LegalModal onClose={() => setShowLegal(false)} onExport={() => {}} onDeleteAccount={() => {}} />}
    </div>
  );
};

export default App;