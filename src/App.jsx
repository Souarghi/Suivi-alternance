import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckSquare, 
  Search, Pencil, X, Mail, ArrowUpDown, AlertTriangle, 
  ExternalLink, FileText, Upload, FileCheck 
} from 'lucide-react';

// 👇 REMETS TES CLÉS SUPABASE ICI
const supabaseUrl = 'https://mvloohmnvggirpdfhotb.supabase.co';
const supabaseKey = 'sb_publishable_fAGf692lpXVGI1YZgyx3Ew_Dz_tEEYO';


const supabase = createClient(supabaseUrl, supabaseKey);

// --- 1. BARRE DE RACCOURCIS (Mise à jour avec tes liens promo) ---
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
      
      if (error) alert("Erreur sauvegarde CV : " + error.message);
      else setProfile(prev => ({ ...prev, ...updateData }));
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
  
  const filteredApps = applications
    .filter(app => app.company.toLowerCase().includes(searchTerm.toLowerCase()) || app.role.toLowerCase