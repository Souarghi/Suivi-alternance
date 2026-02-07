import React from 'react';
import { Pencil, Trash2, Heart, MapPin, Mail, ExternalLink } from 'lucide-react';

const MobileView = ({ applications, toggleFavorite, calculateRelance, toggleRelance, handleDelete, handleEdit }) => {
  return (
    <div className="md:hidden space-y-4 pb-20">
      {applications.map(app => (
        <div key={app.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
          
          {/* En-tête Carte */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-[#0f1f41] text-lg leading-tight">{app.company}</h3>
              <p className="text-gray-500 text-sm font-medium">{app.role}</p>
            </div>
            <button onClick={() => toggleFavorite(app)} className="p-1">
              <Heart size={22} className={app.isFavorite ? "fill-red-500 text-red-500" : "text-gray-300"} />
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                app.status === 'Postulé' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                app.status === 'Refusé' ? 'bg-red-50 border-red-200 text-red-700' :
                app.status === 'Accepté' ? 'bg-green-50 border-green-200 text-green-700' :
                'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
                {app.status}
            </span>
            <span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded-lg bg-gray-50">
                via {app.source}
            </span>
          </div>

          {/* Infos Contact */}
          <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            {app.location && <span className="flex items-center gap-2"><MapPin size={14} className="text-gray-400"/> {app.location}</span>}
            {app.contact_email && <a href={`mailto:${app.contact_email}`} className="text-blue-600 flex items-center gap-2 font-medium"><Mail size={14}/> {app.contact_email}</a>}
            {app.application_url && <a href={app.application_url} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-2 font-medium"><ExternalLink size={14}/> Voir l'annonce</a>}
            {!app.location && !app.contact_email && !app.application_url && <span className="text-gray-400 italic text-xs">Aucune info complémentaire</span>}
          </div>

          {/* Actions Bas de carte */}
          <div className="flex justify-between items-center border-t border-gray-100 pt-3">
            <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                    <input type="checkbox" checked={app.relanceDone || false} onChange={() => toggleRelance(app)} className="peer sr-only" />
                    <div className={`w-5 h-5 border-2 rounded transition-colors ${app.relanceDone ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}></div>
                    {app.relanceDone && <svg className="w-3 h-3 text-white absolute top-1 left-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wide ${app.relanceDone ? 'text-green-600' : 'text-orange-600'}`}>
                    {app.relanceDone ? "Relancé" : `Relance : ${calculateRelance(app.date)}`}
                </span>
            </label>

            <div className="flex gap-2">
                <button onClick={() => handleEdit(app)} className="p-2 bg-blue-50 text-blue-600 rounded-lg active:scale-95 transition-transform"><Pencil size={18}/></button>
                <button onClick={() => handleDelete(app.id)} className="p-2 bg-red-50 text-red-500 rounded-lg active:scale-95 transition-transform"><Trash2 size={18}/></button>
            </div>
          </div>
        </div>
      ))}
      {applications.length === 0 && <div className="text-center text-gray-400 py-10">Aucune candidature trouvée 🕵️‍♂️</div>}
    </div>
  );
};

export default MobileView;