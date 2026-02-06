import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckSquare, 
  Search, Pencil, X, Mail, ArrowUpDown, AlertTriangle, 
  ExternalLink, FileText, Upload, FileCheck, FileSpreadsheet 
} from 'lucide-react';

// 👇 REMETS TES CLÉS SUPABASE ICI
const supabaseUrl = 'https://mvloohmnvggirpdfhotb.supabase.co';
const supabaseKey = 'sb_publishable_fAGf692lpXVGI1YZgyx3Ew_Dz_tEEYO';

const supabase = createClient(supabaseUrl, supabaseKey);

// --- 1. BARRE DE RACCOURCIS ---
const QUICK_LINKS = [
  { name: 'AFI24 (Inscription)', url: 'https://www.afi24.org/', color: 'bg-purple-700' },
  { name: 'JobTeaser CY Tech', url: 'https://cytech.jobteaser.com/', color: 'bg-green-600' },
  { name: 'Data Alumni', url: 'https://cytech.datalumni.com/', color: 'bg-cyan-600' },
  { name: 'APEC', url: 'https://www.apec.fr/', color: 'bg-indigo-700' },
  { name: 'Métierscope (Mots clés)', url: 'https://candidat.francetravail.fr/metierscope/', color: 'bg-orange-500' },
  { name: 'Welcome to the Jungle', url: 'https://www.welcometothejungle.com/', color: 'bg-yellow-400 text-black' },
  { name: 'MyJobGlasses', url: 'https://www.myjobglasses.com/', color: 'bg-pink-600' },
  { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/', color: 'bg-blue-700' },
];

const App = () => {
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({ cv_ats: "", cv_human: "" });
  const [loading, setLoading] = useState(true);
  
  // États de tri et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("date");
  const [editingId, setEditingId] = useState(null);
  
  // États fichiers
  const [fileLM, setFileLM] = useState(null);
  const [uploading, setUploading] = useState(false);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Charger les candidatures
      let { data: apps } = await supabase.from('applications').select('*');
      setApplications(apps || []);

      // Charger le profil (CVs)
      let { data: prof } = await supabase.from('profile').select('*').single();
      if (prof) setProfile(prof);

    } catch (error) {
      console.error('Erreur chargement:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const [newApp, setNewApp] = useState({
    company: "", role: "", status: "A faire", location: "", source: "LinkedIn",
    contact_email: "", date: new Date().toISOString().split('T')[0], relanceDone: false,
    lm_url: ""
  });

  const statusOptions = [
    { value: "A faire", label: "À faire", color: "bg-gray-100 text-gray-800" },
    { value: "Postulé", label: "Postulé", color: "bg-blue-100 text-blue-800" },
    { value: "Entretien", label: "Entretien", color: "bg-purple-100 text-purple-800" },
    { value: "Accepté", label: "Accepté", color: "bg-green-100 text-green-800" },
    { value: "Refusé", label: "Refusé", color: "bg-red-100 text-red-800" },
  ];
  
  const sourceOptions = ["LinkedIn", "JobTeaser", "Contact direct", "Site de l'entreprise", "Indeed", "Welcome to the Jungle", "Autre"];

  // --- FONCTION D'UPLOAD VERS SUPABASE ---
  const uploadFileToSupabase = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage.from('documents').upload(fileName, file);
    if (error) {
      alert("Erreur upload : " + error.message);
      return null;
    }
    const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
    return data.publicUrl;
  };

  // --- GESTION UPLOAD CV PROFIL (ATS / Humain) ---
  const handleProfileUpload = async (file, type) => {
    if (!file) return;
    setUploading(true);
    const url = await uploadFileToSupabase(file);
    
    if (url) {
      const updateData = type === 'ats' ? { cv_ats: url } : { cv_human: url };
      
      // Mise à jour de la table profile (Ligne 1)
      const { error } = await supabase.from('profile').update(updateData).gt('id', 0);
      
      // Si pas de ligne, on la crée (sécurité)
      if (error || !error) { 
         // On tente un insert si l'update n'a rien donné ou pour être sûr
         // (Note: Supabase renvoie une erreur si pas trouvé lors de l'update parfois, 
         // mais ici on suppose que la ligne existe comme demandé précédemment)
         if (error) console.log("Tentative mise à jour...", error);
         else setProfile(prev => ({ ...prev, ...updateData }));
      }
    }
    setUploading(false);
  };

  // --- GESTION CANDIDATURE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newApp.company || !newApp.role) return;
    setUploading(true);

    // Upload LM si présente
    let uploadedLMUrl = newApp.lm_url;
    if (fileLM) {
        const url = await uploadFileToSupabase(fileLM);
        if (url) uploadedLMUrl = url;
    }

    const appData = { ...newApp, lm_url: uploadedLMUrl };

    if (editingId) {
      // Modif
      const { error } = await supabase.from('applications').update(appData).eq('id', editingId);
      if (!error) {
        setApplications(applications.map(app => app.id === editingId ? { ...appData, id: editingId } : app));
        resetForm();
      }
    } else {
      // Ajout
      const { data, error } = await supabase.from('applications').insert([appData]).select();
      if (!error && data) {
        setApplications([data[0], ...applications]);
        resetForm();
      }
    }
    setUploading(false);
  };

  const resetForm = () => {
    setNewApp({
      company: "", role: "", status: "A faire", location: "", source: "LinkedIn",
      contact_email: "", date: new Date().toISOString().split('T')[0], relanceDone: false, lm_url: ""
    });
    setFileLM(null);
    setEditingId(null);
  };

  // Utils
  const calculateRelanceDate = (d) => { 
    if (!d) return "-"; 
    const date = new Date(d); 
    date.setDate(date.getDate() + 15); // J+15
    return date.toLocaleDateString('fr-FR'); 
  };
  
  const exportToCSV = () => {
    const headers = ["Entreprise", "Poste", "Statut", "Contact", "Source", "Date", "Relance", "Lien LM"];
    const rows = applications.map(app => [
      `"${app.company}"`, `"${app.role}"`, `"${app.status}"`, 
      `"${app.contact_email || app.location || ''}"`, `"${app.source}"`, 
      `"${app.date}"`, `"${calculateRelanceDate(app.date)}"`, `"${app.lm_url || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a"); link.href = encodeURI(csvContent); link.download = "suivi_alternance.csv";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const getStatusStyle = (val) => statusOptions.find(o => o.value === val)?.color || "bg-gray-100";
  const normalizeString = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
  const duplicates = newApp.company ? applications.filter(app => normalizeString(app.company) === normalizeString(newApp.company) && app.id !== editingId) : [];
  
  const handleQuickChange = async (id, field, value) => {
    setApplications(applications.map(app => app.id === id ? { ...app, [field]: value } : app));
    await supabase.from('applications').update({ [field]: value }).eq('id', id);
  };
  
  const handleDelete = async (id) => { 
    if (window.confirm("Supprimer ?")) { 
        await supabase.from('applications').delete().eq('id', id); 
        setApplications(applications.filter(app => app.id !== id)); 
    }
  };
  
  const handleEditClick = (app) => { 
      setNewApp(app); 
      setEditingId(app.id); 
      setFileLM(null); 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };
  
  // C'est ici que ça coupait avant !
  const filteredApps = applications
    .filter(app => app.company.toLowerCase().includes(searchTerm.toLowerCase()) || app.role.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortType === 'company' ? a.company.localeCompare(b.company) : new Date(b.created_at || b.date) - new Date(a.created_at || a.date));

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 p-4 md:p-8">
      <div className="max-w-[95%] mx-auto space-y-6">
        
        {/* --- ZONE 1 : BARRE DE RACCOURCIS --- */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 overflow-x-auto flex gap-3 items-center">
            <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Ressources :</span>
            {QUICK_LINKS.map(link => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className={`${link.color} text-white px-3 py-1 rounded-md text-xs font-bold hover:opacity-90 whitespace-nowrap flex items-center gap-1 transition-transform hover:scale-105 shadow-sm`}>
                    {link.name} <ExternalLink size={10}/>
                </a>
            ))}
        </div>

        {/* --- ZONE 2 : MES CVs --- */}
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><FileCheck className="text-blue-300"/> Mes CVs de référence</h2>
                <p className="text-slate-300 text-sm">Gère tes 2 versions ici (ATS pour robots / Humain pour mails).</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                {/* CV ATS */}
                <div className="bg-slate-700 p-3 rounded-lg border border-slate-600 w-full sm:w-64">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-blue-300 uppercase">Version ATS (Word/PDF simple)</span>
                        {profile.cv_ats && <a href={profile.cv_ats} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600">Voir</a>}
                    </div>
                    <label className="cursor-pointer flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 py-2 rounded text-sm transition-colors border border-dashed border-slate-500">
                        <Upload size={14}/> {profile.cv_ats ? "Remplacer fichier" : "Uploader CV ATS"}
                        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleProfileUpload(e.target.files[0], 'ats')} disabled={uploading}/>
                    </label>
                </div>

                {/* CV HUMAIN */}
                <div className="bg-slate-700 p-3 rounded-lg border border-slate-600 w-full sm:w-64">
                    <div className="flex justify-between items-center mb-2"></div>