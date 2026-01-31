import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, ChevronRight, User, Stethoscope, Briefcase, Send, UploadCloud, MessageSquare } from 'lucide-react';

// pagina azienda
export const SectionAzienda = () => (
  <div className="container mx-auto px-6 py-12 animate-fade-in">
    <div className="flex flex-col md:flex-row gap-12 items-center">
      <div className="md:w-1/2">
        <img 
          src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop" 
          alt="Clinica Esterno" 
          className="rounded-lg shadow-xl"
        />
      </div>
      <div className="md:w-1/2 space-y-6">
        <h2 className="text-4xl font-bold text-[#0d47a1]">Eccellenza e Umanità dal 2025</h2>
        <p className="text-gray-600 leading-relaxed">
          La <strong>Clinica Privata Cantagallo</strong> rappresenta un punto di riferimento per la sanità privata, coniugando tecnologie diagnostiche all'avanguardia con un approccio profondamente umano alla cura del paziente.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Fondata dal Dott. Cantagallo con l'obiettivo di creare un ambiente accogliente e altamente specializzato, oggi la struttura si basa su specialisti e tecnologie di ultima generazione per la diagnostica per immagini e la chirurgia.
        </p>

        {/* box: mission e vision(obiettivi) */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-[#0d47a1]">
            <h4 className="font-bold text-[#0d47a1]">Mission</h4>
            <p className="text-sm text-gray-600">Porre il paziente al centro del percorso di cura con ascolto e competenza.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-[#d32f2f]">
            <h4 className="font-bold text-[#d32f2f]">Vision</h4>
            <p className="text-sm text-gray-600">Innovazione tecnologica continua e formazione costante dello staff.</p>
          </div>
        </div>

      </div>
    </div>
  </div>
);

// Tutti i reparti
export const SectionReparti = ({ onEnter }) => {
  const reparti = [
    { title: "Cardiologia", desc: "Diagnostica avanzata, ECG, Holter e visite specialistiche per la salute del tuo cuore." },
    { title: "Ortopedia", desc: "Trattamento di patologie osteoarticolari, traumatologia e riabilitazione motoria." },
    { title: "Chirurgia Generale", desc: "Interventi in regime di Day Surgery con tecniche mininvasive e laparoscopiche." },
    { title: "Oculistica", desc: "Esami della vista, chirurgia della cataratta e correzione difetti refrattivi." },
    { title: "Dermatologia", desc: "Mappatura nei, trattamento patologie cutanee e medicina estetica." },
    { title: "Laboratorio Analisi", desc: "Prelievi ed esami del sangue con refertazione rapida anche online." },
  ];

  return (
    <div className="container mx-auto px-6 py-12 animate-fade-in">
      <h2 className="text-3xl font-bold text-[#0d47a1] mb-8 text-center">I Nostri Reparti</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reparti.map((rep, idx) => (
          <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition group">
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center text-[#0d47a1] mb-4 group-hover:bg-[#0d47a1] group-hover:text-white transition">
              <Stethoscope size={24}/>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{rep.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{rep.desc}</p>
            <button onClick={onEnter} className="text-[#0d47a1] font-bold text-sm flex items-center gap-1 group-hover:underline cursor-pointer">
              Scopri di più <ChevronRight size={16}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pulsante medici
export const SectionMedici = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data))
      .catch(err => console.error("Errore fetch medici", err));
  }, []);

  return (
    <div className="container mx-auto px-6 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#0d47a1]">La Nostra Equipe</h2>
        <p className="text-gray-500 mt-2">Professionisti di alto livello al servizio della tua salute.</p>
      </div>

      {doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:-translate-y-1 transition duration-300">
              <div className="h-48 bg-gray-200 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <User size={64} className="text-blue-300" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800">{doc.name}</h3>
                <p className="text-[#0d47a1] font-medium text-sm mb-4">{doc.spec}</p>
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 flex items-center gap-2"><Mail size={12}/> {doc.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400 italic">Caricamento elenco medici...</p>
        </div>
      )}
    </div>
  );
};

// pagina dei contatti
export const SectionContatti = () => {
  const [msg, setMsg] = useState({ first_name: '', last_name: '', email: '', text: '' });

  const handleSend = async (e) => {
    e.preventDefault();
    try {
        const payload = { ...msg, date: new Date().toLocaleDateString('it-IT') };
        const res = await fetch('http://127.0.0.1:8000/api/messages', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if(res.ok) {
            alert("Messaggio inviato con successo! Ti risponderemo presto.");
            setMsg({ first_name: '', last_name: '', email: '', text: '' });
        } else alert("Errore invio.");
    } catch(err) { alert("Errore di connessione."); }
  };

  return (
    <div className="container mx-auto px-6 py-12 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-[#0d47a1] mb-6">Contattaci</h2>
                  <p className="text-gray-600 mb-8">Siamo a tua disposizione per informazioni, prenotazioni e ritiro referti.</p>
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-full text-[#0d47a1]"><MapPin size={24}/></div>
                      <div><h4 className="font-bold text-gray-800">Dove Siamo</h4><p className="text-gray-600">Via Vittorio Fiore 28<br/>94018 Troina (EN)</p></div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-full text-[#0d47a1]"><Phone size={24}/></div>
                      <div><h4 className="font-bold text-gray-800">Telefono / WhatsApp</h4><p className="text-gray-600">+39 392 078 0712<br/><span className="text-xs text-gray-400">Lun-Ven 8:00 - 20:00</span></p></div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-full text-[#0d47a1]"><Mail size={24}/></div>
                      <div><h4 className="font-bold text-gray-800">Email</h4><p className="text-gray-600">cantagallogioele@gmail.com</p></div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><MessageSquare size={20}/> Inviaci un messaggio</h3>
                <form className="space-y-4" onSubmit={handleSend}>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" required placeholder="Nome" className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#0d47a1]" value={msg.first_name} onChange={e => setMsg({...msg, first_name: e.target.value})} />
                        <input type="text" required placeholder="Cognome" className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#0d47a1]" value={msg.last_name} onChange={e => setMsg({...msg, last_name: e.target.value})} />
                    </div>
                    <input type="email" required placeholder="Email" className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#0d47a1]" value={msg.email} onChange={e => setMsg({...msg, email: e.target.value})} />
                    <textarea required placeholder="Il tuo messaggio..." className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#0d47a1] h-32" value={msg.text} onChange={e => setMsg({...msg, text: e.target.value})}></textarea>
                    <button type="submit" className="w-full bg-[#0d47a1] text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition">Invia Richiesta</button>
                </form>
            </div>
        </div>
    </div>
  );
};

// invia candidatura lavoro (lavora con noi)
export const SectionLavoraConNoi = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', position: 'Infermiere', message: '' });
  const [cvFile, setCvFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cvFile) return alert("Per favore carica il tuo CV.");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("position", form.position);
    formData.append("message", form.message);
    formData.append("date", new Date().toLocaleDateString('it-IT'));
    formData.append("cv", cvFile);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/applications', {
        method: 'POST', 
        body: formData 
      });
      if (res.ok) {
        alert("Candidatura inviata con successo! Ti contatteremo presto.");
        setForm({ name: '', email: '', phone: '', position: 'Infermiere', message: '' });
        setCvFile(null);
      } else { alert("Errore nell'invio."); }
    } catch (e) { alert("Errore di connessione."); }
  };

  return (
    <div className="container mx-auto px-6 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#0d47a1]">Lavora con Noi</h2>
        <p className="text-gray-500 mt-2">Entra a far parte della nostra equipe di eccellenza.</p>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nome e Cognome</label>
              <input type="text" required className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#0d47a1]" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input type="email" required className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#0d47a1]" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Telefono</label>
              <input type="text" required className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#0d47a1]" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Posizione</label>
              <select className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#0d47a1]" value={form.position} onChange={e => setForm({...form, position: e.target.value})}>
                <option>Infermiere</option>
                <option>Medico Specialista</option>
                <option>Operatore OSS</option>
                <option>Segreteria / Amministrazione</option>
                <option>Tecnico di Laboratorio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Lettera di Presentazione</label>
            <textarea className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#0d47a1] h-32" value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
            <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
            <label className="cursor-pointer">
              <span className="bg-[#0d47a1] text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-blue-800 transition">Carica CV (PDF/DOC)</span>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setCvFile(e.target.files[0])} />
            </label>
            <p className="text-sm text-gray-600 mt-2">{cvFile ? cvFile.name : "Nessun file selezionato"}</p>
          </div>

          <button type="submit" className="w-full bg-[#0d47a1] text-white font-bold py-4 rounded-lg hover:bg-blue-800 transition flex items-center justify-center gap-2">
            <Send size={18}/> Invia Candidatura
          </button>
        </form>
      </div>
    </div>
  );
};
