import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Briefcase, Building2, FileSpreadsheet } from 'lucide-react';

const App = () => {
  // 1. CHARGEMENT INITIAL : On regarde s'il y a déjà des données sauvegardées
  const [applications, setApplications] = useState(() => {
    const savedData = localStorage.getItem("suivi_alternance_data");
    if (savedData) {
      return JSON.parse(savedData);
    } else {
      // Données par défaut si c'est la première visite
      return [
        { id: 1, company: "Thales", role: "Développeur Fullstack", date: "2026-02-04", status: "En attente", link: "https://thales.com" },
        { id: 2, company: "L'Oréal", role: "Assistant Marketing", date: "2026-02-01", status: "Entretien", link: "" },
      ];
    }
  });

  const [newApp, setNewApp] = useState({
    company: "",
    role: "",
    date: new Date().toISOString().split('T')[0],
    status: "En attente",
    link: ""
  });

  // 2. SAUVEGARDE AUTOMATIQUE : À chaque modification de 'applications', on sauvegarde
  useEffect(() => {
    localStorage.setItem("suivi_alternance_data", JSON.stringify(applications));
  }, [applications]);

  const statusOptions = [
    { value: "En attente", label: "En attente", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { value: "Entretien", label: "Entretien proposé", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: "Positive", label: "Réponse Positive", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "Négative", label: "Réponse Négative", color: "bg-red-100 text-red-800 border-red-200" },
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newApp.company || !newApp.role) return;
    setApplications([...applications, { ...newApp, id: Date.now() }]);
    setNewApp({ ...newApp, company: "", role: "" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette candidature ?")) {
      setApplications(applications.filter(app => app.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));
  };

  const getStatusStyle = (statusVal) => {
    const option = statusOptions.find(o => o.value === statusVal);
    return option ? option.color : "bg-gray-100";
  };

  const exportToCSV = () => {
    const headers = ["Entreprise", "Poste", "Date", "Statut", "Lien"];
    const rows = applications.map(app => [
      `"${app.company}"`, `"${app.role}"`, `"${app.date}"`, `"${app.status}"`, `"${app.link}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "suivi_alternance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Briefcase className="text-blue-600" /> Suivi Alternance
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {applications.length} candidature{applications.length > 1 ? 's' : ''} en cours
            </p>
          </div>
          <button onClick={exportToCSV} className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm">
            <FileSpreadsheet size={18} /> Exporter CSV
          </button>
        </div>

        {/* Formulaire */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus size={20} className="text-blue-600" /> Nouvelle candidature</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input type="text" placeholder="Ex: Thales" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newApp.company} onChange={(e) => setNewApp({...newApp, company: e.target.value})} required />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input type="text" placeholder="Ex: Dév Web" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newApp.role} onChange={(e) => setNewApp({...newApp, role: e.target.value})} required />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newApp.date} onChange={(e) => setNewApp({...newApp, date: e.target.value})} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={newApp.status} onChange={(e) => setNewApp({...newApp, status: e.target.value})}>
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2"><Plus size={18} /> Ajouter</button>
            </div>
          </form>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase">
                  <th className="p-4 font-semibold">Entreprise</th>
                  <th className="p-4 font-semibold">Poste</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Statut</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500">Aucune candidature enregistrée. Ajoutez-en une !</td>
                    </tr>
                ) : applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{app.company}</td>
                    <td className="p-4 text-gray-600">{app.role}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{new Date(app.date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4">
                      <select value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)} className={`appearance-none px-4 py-1.5 pr-8 rounded-full text-sm font-medium border focus:ring-2 outline-none cursor-pointer transition-colors ${getStatusStyle(app.status)}`}>
                        {statusOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-white text-gray-900">{opt.label}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(app.id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors"><Trash2 size={18} /></button>
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