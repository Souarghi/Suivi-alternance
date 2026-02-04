import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckSquare, FileSpreadsheet } from 'lucide-react';

// ⚠️ REMPLACE CES DEUX LIGNES PAR TES INFOS SUPABASE
const supabaseUrl = 'https://mvloohmnvggirpdfhotb.supabase.co'; 
const supabaseKey = 'sb_publishable_fAGf692lpXVGI1YZgyx3Ew_Dz_tEEYO';

const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. CHARGEMENT DES DONNÉES DEPUIS LE CLOUD
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      let { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false }); // Les plus récents en haut
      
      if (error) throw error;
      setApplications(data);
    } catch (error) {
      console.log('Erreur chargement:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const [newApp, setNewApp] = useState({
    company: "",
    role: "",
    status: "A faire",
    location: "",
    source: "LinkedIn",
    date: new Date().toISOString().split('T')[0],
    relanceDone: false
  });

  const statusOptions = [
    { value: "A faire", label: "À faire", color: "bg-gray-100 text-gray-800 border-gray-200" },
    { value: "Postulé", label: "Postulé", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: "Entretien", label: "Entretien", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { value: "Accepté", label: "Accepté", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "Refusé", label: "Refusé", color: "bg-red-100 text-red-800 border-red-200" },
  ];

  const sourceOptions = ["LinkedIn", "JobTeaser", "Contact direct", "Site de l'entreprise", "Indeed", "Welcome to the Jungle", "Autre"];

  const calculateRelanceDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    date.setDate(date.getDate() + 10);
    return date.toLocaleDateString('fr-FR');
  };

  const getStatusStyle = (statusVal) => {
    const option = statusOptions.find(o => o.value === statusVal);
    return option ? option.color : "bg-gray-100";
  };

  // 2. AJOUTER (Sauvegarde Cloud)
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newApp.company || !newApp.role) return;

    const { data, error } = await supabase
      .from('applications')
      .insert([newApp])
      .select();

    if (!error && data) {
      setApplications([data[0], ...applications]);
      setNewApp({
        company: "",
        role: "",
        status: "A faire",
        location: "",
        source: "LinkedIn",
        date: new Date().toISOString().split('T')[0],
        relanceDone: false
      });
    }
  };

  // 3. SUPPRIMER (Sauvegarde Cloud)
  const handleDelete = async (id) => {
    if (window.confirm("Supprimer définitivement ?")) {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setApplications(applications.filter(app => app.id !== id));
      }
    }
  };

  // 4. MODIFIER (Sauvegarde Cloud)
  const handleChange = async (id, field, value) => {
    // Mise à jour optimiste (l'interface change tout de suite)
    setApplications(applications.map(app => 
      app.id === id ? { ...app, [field]: value } : app
    ));

    // Envoi à la base de données
    await supabase
      .from('applications')
      .update({ [field]: value })
      .eq('id', id);
  };

  const exportToCSV = () => {
    const headers = ["Entreprise", "Poste", "Statut", "Lieu", "Source", "Date Envoi", "Date Relance (J+10)", "Relance Faite"];
    const rows = applications.map(app => [
      `"${app.company}"`, `"${app.role}"`, `"${app.status}"`, `"${app.location}"`, `"${app.source}"`, `"${app.date}"`, `"${calculateRelanceDate(app.date)}"`, `"${app.relanceDone ? 'OUI' : 'NON'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "suivi_candidatures_cloud.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 p-4 md:p-8">
      <div className="max-w-[95%] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Briefcase className="text-blue-600" /> Suivi Cloud ☁️
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? "Chargement..." : `${applications.length} candidature(s) synchronisée(s)`}
            </p>
          </div>
          <button onClick={exportToCSV} className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm">
            <FileSpreadsheet size={18} /> Export CSV
          </button>
        </div>

        {/* Formulaire d'ajout */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus size={20} className="text-blue-600" /> Ajouter une ligne</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 items-end">
            
            <div className="md:col-span-3 lg:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Entreprise</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input type="text" placeholder="Thales" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={newApp.company} onChange={(e) => setNewApp({...newApp, company: e.target.value})} required />
              </div>
            </div>

            <div className="md:col-span-3 lg:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Poste</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input type="text" placeholder="Dev Java" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={newApp.role} onChange={(e) => setNewApp({...newApp, role: e.target.value})} required />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Lieu</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input type="text" placeholder="Paris" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={newApp.location} onChange={(e) => setNewApp({...newApp, location: e.target.value})} />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Source</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" value={newApp.source} onChange={(e) => setNewApp({...newApp, source: e.target.value})}>
                {sourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date envoi</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={newApp.date} onChange={(e) => setNewApp({...newApp, date: e.target.value})} required />
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2 text-sm"><Plus size={16} /> Ajouter</button>
            </div>
          </form>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">Entreprise</th>
                  <th className="p-4">Poste</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Lieu</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Date envoi</th>
                  <th className="p-4">Relance (J+10)</th>
                  <th className="p-4 text-center">Relancé</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                    <tr><td colSpan="9" className="p-8 text-center text-gray-500">Synchronisation avec la base de données...</td></tr>
                ) : applications.length === 0 ? (
                    <tr><td colSpan="9" className="p-8 text-center text-gray-500">Aucune donnée trouvée.</td></tr>
                ) : applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 font-bold text-gray-900">{app.company}</td>
                    <td className="p-4 text-gray-700">{app.role}</td>
                    <td className="p-4">
                      <select value={app.status} onChange={(e) => handleChange(app.id, 'status', e.target.value)} className={`appearance-none px-3 py-1 pr-8 rounded-full text-xs font-bold border focus:ring-2 outline-none cursor-pointer ${getStatusStyle(app.status)}`}>
                        {statusOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-white text-gray-900">{opt.label}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-gray-600 flex items-center gap-1"><MapPin size={14} className="text-gray-400"/> {app.location || "-"}</td>
                    <td className="p-4">
                      <select value={app.source} onChange={(e) => handleChange(app.id, 'source', e.target.value)} className="bg-transparent hover:border-gray-300 outline-none py-1 text-gray-600 cursor-pointer w-full">
                         {sourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{new Date(app.date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 w-fit">
                            <Calendar size={12} /> {calculateRelanceDate(app.date)}
                        </div>
                    </td>
                    <td className="p-4 text-center">
                        <button onClick={() => handleChange(app.id, 'relanceDone', !app.relanceDone)} className={`p-1.5 rounded ${app.relanceDone ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            <CheckSquare size={20} className={app.relanceDone ? "fill-current" : ""} />
                        </button>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(app.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;