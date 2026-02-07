import React from 'react';
import { Pencil, Trash2, Heart, MapPin, Mail, ExternalLink, CheckCircle } from 'lucide-react';

const DesktopView = ({ applications, toggleFavorite, calculateRelance, toggleRelance, handleDelete, handleEdit }) => {
  return (
    <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b">
          <tr>
            <th className="p-4 w-10"></th>
            <th className="p-4">Entreprise</th>
            <th className="p-4">Poste</th>
            <th className="p-4">Statut</th>
            <th className="p-4">Infos / Lien</th>
            <th className="p-4 text-center">Relance (J+15)</th>
            <th className="p-4 text-center">Fait ?</th>
            <th className="p-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {applications.map(app => (
            <tr key={app.id} className="hover:bg-gray-50 group transition-colors">
              <td className="p-4">
                <button onClick={() => toggleFavorite(app)} className="hover:scale-110 transition-transform">
                  <Heart size={18} className={app.isFavorite ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-300"} />
                </button>
              </td>
              <td className="p-4 font-bold text-[#0f1f41]">{app.company}</td>
              <td className="p-4 text-gray-600">{app.role}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  app.status === 'Postulé' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                  app.status === 'Refusé' ? 'bg-red-50 border-red-200 text-red-700' :
                  app.status === 'Accepté' ? 'bg-green-50 border-green-200 text-green-700' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  {app.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex flex-col text-xs gap-1">
                  {app.location && <span className="font-bold text-gray-700 flex items-center gap-1"><MapPin size={10} /> {app.location}</span>}
                  {app.contact_email && <a href={`mailto:${app.contact_email}`} className="text-blue-500 hover:underline flex items-center gap-1"><Mail size={10} /> {app.contact_email}</a>}
                  {app.application_url && <a href={app.application_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><ExternalLink size={10} /> Voir l'annonce</a>}
                </div>
              </td>
              <td className="p-4 text-center">
                <span className={`text-xs font-bold px-2 py-1 rounded ${app.relanceDone ? 'bg-green-100 text-green-700 line-through opacity-50' : 'bg-orange-50 text-orange-600'}`}>
                  {calculateRelance(app.date)}
                </span>
              </td>
              <td className="p-4 text-center">
                <input type="checkbox" checked={app.relanceDone || false} onChange={() => toggleRelance(app)} className="w-5 h-5 cursor-pointer accent-green-600 rounded" />
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(app)} className="text-gray-400 hover:text-blue-500 p-1 bg-gray-50 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(app.id)} className="text-gray-400 hover:text-red-500 p-1 bg-gray-50 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {applications.length === 0 && <div className="p-10 text-center text-gray-400 italic">Aucune candidature pour le moment.</div>}
    </div>
  );
};

export default DesktopView;