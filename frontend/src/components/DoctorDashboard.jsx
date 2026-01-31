import React, { useState, useEffect } from 'react';
import { 
  LogOut, Calendar as CalIcon, ChevronLeft, ChevronRight, User, Activity, 
  FileText, Pill, Download, Heart, Thermometer, Weight, Plus, Save, Search, 
  Settings, Lock, Droplet, Megaphone, CheckSquare
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine 
} from 'recharts';

const DoctorDashboard = ({ onLogout, user }) => {
  const [activePage, setActivePage] = useState('calendario');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientTab, setPatientTab] = useState('quadro'); 
  const [chartView, setChartView] = useState('cardio'); 

  // Dati generali
  const [allAppointments, setAllAppointments] = useState([]); 
  const [allPatients, setAllPatients] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [readAnnouncements, setReadAnnouncements] = useState([]); 
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dati Clinici
  const [medications, setMedications] = useState([]);
  const [vitalData, setVitalData] = useState([]);
  const [latest, setLatest] = useState({ press: 'N/D', inr: 'N/D', hr: 'N/D', weight: 'N/D', sat: 'N/D' });
  const [visitNote, setVisitNote] = useState("");

  const [newDrug, setNewDrug] = useState({ name: '', dose: '', freq: '' });
  const [newVital, setNewVital] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    inr: '', press_max: '', press_min: '', heart_rate: '', sat: '', weight: '', temp: '' 
  });

  const [pwdData, setPwdData] = useState({ old: '', new: '' });

  useEffect(() => { 
      fetchAppointments(); 
      fetchPatients(); 
      fetchAnnouncements();
      // Carica messaggi letti dal LocalStorage
      const savedRead = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
      setReadAnnouncements(savedRead);
  }, []);

  const fetchAppointments = async () => { try { const res = await fetch(`http://127.0.0.1:8000/api/appointments/${user.email}`); if (res.ok) setAllAppointments(await res.json()); } catch (e) { console.error(e); } };
  const fetchPatients = async () => { try { const res = await fetch('http://127.0.0.1:8000/api/patients'); if (res.ok) setAllPatients(await res.json()); } catch (e) { console.error(e); } };
  const fetchAnnouncements = async () => { try { const res = await fetch('http://127.0.0.1:8000/api/announcements'); if (res.ok) setAnnouncements(await res.json()); } catch (e) { console.error(e); } };

  // Filtra pazienti
  const filteredPatients = allPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Conta messaggi non letti
  const unreadCount = announcements.filter(a => !readAnnouncements.includes(a.id)).length;

  useEffect(() => { if (selectedPatient) fetchClinicalData(); }, [selectedPatient]);

  const getSelectedEmail = () => selectedPatient?.email || selectedPatient?.patient_email || "";
  const getSelectedName = () => selectedPatient?.name || selectedPatient?.patient_name || "Paziente";

  const fetchClinicalData = async () => {
    try {
      const email = getSelectedEmail() || "paziente_temp@clinica.it";
      const res = await fetch(`http://127.0.0.1:8000/api/clinical/${email}`);
      if (res.ok) {
        const data = await res.json();
        setMedications(data.medications);
        setVitalData(data.vitals);
        setVisitNote(data.notes || "");
        if (data.vitals.length > 0) {
          const l = data.vitals[data.vitals.length - 1];
          setLatest({
            press: l.press_max ? `${l.press_max}/${l.press_min}` : 'N/D',
            inr: l.inr || 'N/D',
            hr: l.heart_rate || 'N/D',
            weight: l.weight || 'N/D',
            sat: l.sat || 'N/D'
          });
        } else {
          setLatest({ press: 'N/D', inr: 'N/D', hr: 'N/D', weight: 'N/D', sat: 'N/D' });
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleMarkAsRead = (id) => {
      const updated = [...readAnnouncements, id];
      setReadAnnouncements(updated);
      localStorage.setItem('readAnnouncements', JSON.stringify(updated));
  };

  const handleAddDrug = async (e) => { e.preventDefault(); if (!newDrug.name) return; const email = getSelectedEmail(); await fetch(`http://127.0.0.1:8000/api/clinical/${email}/medications`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newDrug) }); setNewDrug({ name: '', dose: '', freq: '' }); fetchClinicalData(); };
  const handleRemoveDrug = async (medName) => { const email = getSelectedEmail(); await fetch(`http://127.0.0.1:8000/api/clinical/${email}/medications/remove`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name: medName, dose:"", freq:""}) }); fetchClinicalData(); };
  
  const handleAddVital = async (e) => {
    e.preventDefault();
    const email = getSelectedEmail();
    const payload = {
        date: newVital.date,
        inr: newVital.inr ? parseFloat(newVital.inr) : null,
        press_max: newVital.press_max ? parseInt(newVital.press_max) : null,
        press_min: newVital.press_min ? parseInt(newVital.press_min) : null,
        heart_rate: newVital.heart_rate ? parseInt(newVital.heart_rate) : null,
        sat: newVital.sat ? parseInt(newVital.sat) : null,
        weight: newVital.weight ? parseFloat(newVital.weight) : null,
        temp: newVital.temp ? parseFloat(newVital.temp) : null,
    };
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/clinical/${email}/vitals`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
        if (res.ok) { setNewVital({ date: new Date().toISOString().split('T')[0], inr: '', press_max: '', press_min: '', heart_rate: '', sat: '', weight: '', temp: '' }); fetchClinicalData(); }
    } catch (err) { alert("Errore di connessione."); }
  };

  const handleSaveNote = async () => { const email = getSelectedEmail(); try { const res = await fetch(`http://127.0.0.1:8000/api/clinical/${email}/notes`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ text: visitNote }) }); if (res.ok) alert("Note salvate!"); } catch(e) { alert("Errore connessione"); } };
  const handleChangePassword = async () => { if (!pwdData.old || !pwdData.new) return alert("Compila i campi password"); try { const res = await fetch('http://127.0.0.1:8000/api/update-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, old_password: pwdData.old, new_password: pwdData.new, role: "dottore" }) }); if (res.ok) { alert("Password aggiornata!"); setPwdData({ old: '', new: '' }); } else { const d = await res.json(); alert(d.detail); } } catch (err) { alert("Errore connessione"); } };

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const getAppointmentsForDay = (day) => allAppointments.filter(app => { const d = new Date(app.date); return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear(); });

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-[#f8f9fa] border-r border-gray-200 flex flex-col z-10">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-white"><span className="text-gray-500 font-bold text-xs tracking-widest uppercase">Area Medica</span></div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<CalIcon size={18}/>} text="Piano di Lavoro" active={activePage === 'calendario'} onClick={() => {setActivePage('calendario'); setSelectedPatient(null);}} />
          <SidebarItem icon={<User size={18}/>} text="Pazienti della Clinica" active={activePage === 'pazienti'} onClick={() => setActivePage('pazienti')} />
          
          <SidebarItem 
            icon={<Megaphone size={18}/>} 
            text="Avvisi Direzione" 
            active={activePage === 'avvisi'} 
            onClick={() => setActivePage('avvisi')} 
            badge={unreadCount}
          />
          <SidebarItem icon={<Settings size={18}/>} text="Il Mio Profilo" active={activePage === 'profilo'} onClick={() => {setActivePage('profilo'); setSelectedPatient(null);}} />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[#0d47a1] text-white flex items-center justify-between px-6 shadow-md z-20">
          <h1 className="font-bold text-lg tracking-wide uppercase">Clinica Privata Cantagallo</h1>
          <div className="flex items-center gap-4"><span className="text-sm font-bold">Dr. {user.name}</span><button onClick={onLogout} className="bg-white/10 px-3 py-1 rounded text-sm font-bold flex items-center gap-2 hover:bg-white/20"><LogOut size={16} /> Logout</button></div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          
          {/* Pagina del calendario */}
          {activePage === 'calendario' && (
            <div className="p-6 h-full overflow-y-auto animate-fade-in">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-[#0d47a1]"><CalIcon size={24} /><h2 className="text-2xl font-bold text-gray-800">Piano di Lavoro</h2></div>
                  <div className="flex items-center gap-4"><span className="text-xl font-bold capitalize text-gray-700">{currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}</span><div className="flex bg-gray-100 rounded-md"><button onClick={prevMonth} className="p-2 hover:bg-gray-200"><ChevronLeft size={20}/></button><button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 text-sm font-bold bg-white shadow-sm">Oggi</button><button onClick={nextMonth} className="p-2 hover:bg-gray-200"><ChevronRight size={20}/></button></div></div>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-7 bg-blue-50 border-b border-gray-200 text-center py-2 text-sm font-bold text-[#0d47a1] uppercase"><div>Lun</div><div>Mar</div><div>Mer</div><div>Gio</div><div>Ven</div><div>Sab</div><div>Dom</div></div>
                  <div className="grid grid-cols-7 bg-white">{calendarDays.map((day) => { const appsToday = getAppointmentsForDay(day); return (<div key={day} className="min-h-[120px] border-r border-b border-gray-100 p-2 relative group hover:bg-gray-50 transition"><span className="text-sm font-bold text-gray-400 absolute top-2 right-2">{day}</span><div className="mt-6 space-y-1">{appsToday.map((app, idx) => (<button key={idx} onClick={() => {setActivePage('pazienti'); setSelectedPatient(app)}} className="block w-full text-left bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 truncate hover:bg-blue-200 font-medium">{app.patient_name} ({app.time})</button>))}</div></div>);})}</div>
                </div>
              </div>
            </div>
          )}

          {/* Pagina degli avvisi */}
          {activePage === 'avvisi' && (
            <div className="p-6 h-full overflow-y-auto animate-fade-in">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-3xl mx-auto">
                    <div className="flex items-center gap-2 mb-6 text-[#0d47a1]">
                        <Megaphone size={24}/>
                        <h2 className="text-2xl font-bold">Bacheca Avvisi</h2>
                    </div>
                    {announcements.length > 0 ? (
                        <div className="space-y-4">
                            {announcements.map((ann, idx) => {
                                const isRead = readAnnouncements.includes(ann.id);
                                return (
                                    <div key={idx} className={`p-4 rounded-lg border flex justify-between items-start transition ${isRead ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-yellow-50 border-yellow-200 shadow-sm'}`}>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${isRead ? 'bg-gray-200 text-gray-600' : 'bg-yellow-200 text-yellow-800'}`}>
                                                    {ann.date}
                                                </span>
                                                {!isRead && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                                            </div>
                                            <p className={`text-sm ${isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{ann.text}</p>
                                        </div>
                                        {!isRead && (
                                            <button 
                                                onClick={() => handleMarkAsRead(ann.id)} 
                                                className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs font-bold bg-white px-2 py-1 rounded border border-blue-100 hover:border-blue-300"
                                                title="Segna come letto"
                                            >
                                                <CheckSquare size={14}/> Letto
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-center py-10">Nessun avviso presente.</p>
                    )}
                </div>
            </div>
          )}

          {activePage === 'pazienti' && (
            <div className="flex h-full">
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-10 shadow-lg">
                    <div className="p-4 border-b border-gray-200 bg-gray-50"><h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><User size={20} className="text-[#0d47a1]"/> Pazienti della Clinica</h2><div className="relative"><Search size={16} className="absolute left-3 top-2.5 text-gray-400"/><input type="text" placeholder="Cerca nome..." className="w-full pl-9 p-2 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-[#0d47a1] outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div></div>
                    <div className="flex-1 overflow-y-auto">{filteredPatients.length > 0 ? (filteredPatients.map((p, idx) => (<button key={idx} onClick={() => setSelectedPatient(p)} className={`w-full text-left p-4 border-b border-gray-50 hover:bg-blue-50 transition flex items-center gap-3 ${(selectedPatient?.email === p.email || selectedPatient?.patient_email === p.email) ? 'bg-blue-50 border-l-4 border-l-[#0d47a1]' : ''}`}><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-[#0d47a1] font-bold">{p.name.charAt(0)}</div><div><p className="font-bold text-gray-800 text-sm">{p.name}</p><p className="text-xs text-gray-500">{p.email}</p></div></button>))) : (<div className="p-8 text-center text-gray-400 text-sm">Nessun paziente trovato.</div>)}</div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-[#f4f7f6]">
                    {selectedPatient ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start">
                                <div className="flex gap-4"><div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#0d47a1] text-2xl font-bold">{getSelectedName().charAt(0)}</div><div><h2 className="text-3xl font-bold text-[#0d47a1]">{getSelectedName()}</h2><p className="text-gray-500 mt-1">Email: <strong>{getSelectedEmail()}</strong></p></div></div>
                                <button onClick={() => {
                                    const email = getSelectedEmail();
                                    if(email) window.open(`http://127.0.0.1:8000/download-referto/${email}`, '_blank');
                                    else alert("Seleziona un paziente valido");
                                }} className="bg-[#d32f2f] hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-bold shadow-sm flex items-center gap-2 transition"><Download size={18} /> Scarica Cartella</button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <VitalCard icon={<Heart className="text-red-500"/>} label="INR" value={latest.inr} unit="" />
                                <VitalCard icon={<Activity className="text-blue-500"/>} label="Pressione" value={latest.press} unit="mmHg" />
                                <VitalCard icon={<Heart className="text-pink-500"/>} label="Battito" value={latest.hr} unit="bpm" />
                                <VitalCard icon={<Droplet className="text-cyan-500"/>} label="SpO2" value={latest.sat} unit="%" />
                                <VitalCard icon={<Weight className="text-green-500"/>} label="Peso" value={latest.weight} unit="kg" />
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px]">
                                <div className="flex border-b border-gray-200 bg-gray-50"><TabButton active={patientTab === 'quadro'} onClick={() => setPatientTab('quadro')} icon={<Activity size={18}/>} text="Quadro Clinico" /><TabButton active={patientTab === 'terapie'} onClick={() => setPatientTab('terapie')} icon={<Pill size={18}/>} text="Terapie" /><TabButton active={patientTab === 'note'} onClick={() => setPatientTab('note')} icon={<FileText size={18}/>} text="Note / Diario" /></div>
                                <div className="p-8">
                                   {patientTab === 'quadro' && (
                                      <div className="space-y-8">
                                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2 space-y-4">
                                               <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-gray-700">Andamento Grafico</h3><div className="flex bg-gray-100 rounded-lg p-1">{['inr', 'cardio', 'general'].map(v => (<button key={v} onClick={() => setChartView(v)} className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition ${chartView === v ? 'bg-white shadow text-[#0d47a1]' : 'text-gray-500 hover:text-gray-700'}`}>{v === 'inr' ? 'Coagulazione' : v === 'cardio' ? 'Cardiologia' : 'Generale'}</button>))}</div></div>
                                               <div className="h-80 border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">{vitalData.length > 0 ? (<ResponsiveContainer width="100%" height="100%">{chartView === 'inr' ? (<AreaChart data={vitalData}><defs><linearGradient id="colorInr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d47a1" stopOpacity={0.3}/><stop offset="95%" stopColor="#0d47a1" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis domain={[0, 5]}/><Tooltip/><Area type="monotone" dataKey="inr" stroke="#0d47a1" fill="url(#colorInr)" connectNulls={true} /><ReferenceLine y={2.0} stroke="green" strokeDasharray="3 3"/><ReferenceLine y={3.0} stroke="green" strokeDasharray="3 3"/></AreaChart>) : chartView === 'cardio' ? (<LineChart data={vitalData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis/><Tooltip/><Line type="monotone" dataKey="press_max" stroke="#d32f2f" name="P. Max" strokeWidth={3} connectNulls={true} /><Line type="monotone" dataKey="press_min" stroke="#1976d2" name="P. Min" strokeWidth={3} connectNulls={true} /><Line type="monotone" dataKey="heart_rate" stroke="#e91e63" name="BPM" strokeWidth={3} connectNulls={true} /></LineChart>) : (<LineChart data={vitalData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis/><Tooltip/><Line type="monotone" dataKey="weight" stroke="#2e7d32" name="Peso (kg)" strokeWidth={3} connectNulls={true} /><Line type="monotone" dataKey="temp" stroke="#f57c00" name="Temp (°C)" strokeWidth={3} connectNulls={true} /></LineChart>)}</ResponsiveContainer>) : (<div className="h-full flex items-center justify-center text-gray-400 italic">Nessun dato. Inserisci una misurazione.</div>)}</div>
                                            </div>
                                            <div className="bg-blue-50 p-6 rounded-lg h-fit border border-blue-100">
                                                <h4 className="font-bold text-[#0d47a1] mb-4 flex items-center gap-2"><Plus size={18}/> Nuova Misurazione</h4>
                                                <form onSubmit={handleAddVital} className="space-y-3">
                                                    <input className="w-full p-2 rounded border border-blue-200 text-sm" placeholder="Data" type="date" value={newVital.date} onChange={e => setNewVital({...newVital, date: e.target.value})} />
                                                    <input className="w-full p-2 rounded border border-blue-200 text-sm" placeholder="INR (es. 2.5)" type="number" step="0.1" value={newVital.inr} onChange={e => setNewVital({...newVital, inr: e.target.value})} />
                                                    <div className="flex gap-2">
                                                        <input className="w-full p-2 rounded border border-blue-200 text-sm" placeholder="P. Max" type="number" value={newVital.press_max} onChange={e => setNewVital({...newVital, press_max: e.target.value})} />
                                                        <input className="w-full p-2 rounded border border-blue-200 text-sm" placeholder="P. Min" type="number" value={newVital.press_min} onChange={e => setNewVital({...newVital, press_min: e.target.value})} />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input className="w-full p-2 rounded border border-blue-200 text-sm" placeholder="BPM" type="number" value={newVital.heart_rate} onChange={e => setNewVital({...newVital, heart_rate: e.target.value})} />
                                                        <input className="w-full p-2 rounded border border-blue-200 text-sm" placeholder="Peso (Kg)" type="number" step="0.1" value={newVital.weight} onChange={e => setNewVital({...newVital, weight: e.target.value})} />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input className="w-full p-2 rounded border border-blue-200 text-sm" placeholder="Temp (°C)" type="number" step="0.1" value={newVital.temp} onChange={e => setNewVital({...newVital, temp: e.target.value})} />
                                                        <input className="w-full p-2 rounded border border-blue-200 text-sm" placeholder="Sat %" type="number" value={newVital.sat} onChange={e => setNewVital({...newVital, sat: e.target.value})} />
                                                    </div>
                                                    <button type="submit" className="w-full bg-[#0d47a1] text-white py-2 rounded font-bold hover:bg-blue-800 shadow-sm mt-2">Registra Dato</button>
                                                </form>
                                            </div>
                                         </div>
                                         <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-8"><div className="bg-gray-50 px-4 py-3 border-b border-gray-200"><h3 className="font-bold text-gray-700 flex items-center gap-2"><FileText size={18} className="text-[#0d47a1]"/> Storico Misurazioni</h3></div><div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-600"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">Data</th><th className="px-6 py-3">INR</th><th className="px-6 py-3">Pressione</th><th className="px-6 py-3">BPM</th><th className="px-6 py-3">SpO2</th><th className="px-6 py-3">Peso</th><th className="px-6 py-3">Temp</th></tr></thead><tbody>{vitalData.length > 0 ? [...vitalData].reverse().map((row, index) => (<tr key={index} className="bg-white border-b hover:bg-gray-50"><td className="px-6 py-4 font-medium text-gray-900">{row.date}</td><td className="px-6 py-4">{row.inr || '-'}</td><td className="px-6 py-4">{row.press_max ? `${row.press_max}/${row.press_min}` : '-'}</td><td className="px-6 py-4">{row.heart_rate || '-'}</td><td className="px-6 py-4">{row.sat ? row.sat + '%' : '-'}</td><td className="px-6 py-4">{row.weight ? row.weight + ' kg' : '-'}</td><td className="px-6 py-4">{row.temp ? row.temp + ' °C' : '-'}</td></tr>)) : <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400 italic">Nessuna misurazione registrata.</td></tr>}</tbody></table></div></div>
                                      </div>
                                   )}
                                   {patientTab === 'terapie' && (
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                         <div className="md:col-span-2"><h3 className="text-lg font-bold text-gray-700 mb-4">Terapie Attive</h3><div className="space-y-3">{medications.length > 0 ? medications.map((med, i) => (<div key={i} className="flex justify-between items-center p-4 border rounded-lg hover:border-blue-300 bg-gray-50"><div className="flex items-center gap-3"><div className="bg-blue-100 p-2 rounded-full text-[#0d47a1]"><Pill size={20}/></div><div><p className="font-bold text-gray-800">{med.name}</p><p className="text-sm text-gray-500">{med.dose} • {med.freq}</p></div></div><button onClick={() => handleRemoveDrug(med.name)} className="text-red-400 hover:text-red-600 font-bold text-sm">Sospendi</button></div>)) : <p className="text-gray-400 italic">Nessuna terapia prescritta.</p>}</div></div>
                                         <div className="bg-blue-50 p-6 rounded-lg h-fit border border-blue-100"><h4 className="font-bold text-[#0d47a1] mb-4 flex items-center gap-2"><Plus size={18}/> Aggiungi Farmaco</h4><form onSubmit={handleAddDrug} className="space-y-3"><input className="w-full p-2 rounded border border-blue-200 text-sm" placeholder="Nome Farmaco" value={newDrug.name} onChange={e => setNewDrug({...newDrug, name: e.target.value})} /><input className="w-full p-2 rounded border border-blue-200 text-sm" placeholder="Dosaggio (es. 5mg)" value={newDrug.dose} onChange={e => setNewDrug({...newDrug, dose: e.target.value})} /><input className="w-full p-2 rounded border border-blue-200 text-sm" placeholder="Frequenza (es. sera)" value={newDrug.freq} onChange={e => setNewDrug({...newDrug, freq: e.target.value})} /><button type="submit" className="w-full bg-[#0d47a1] text-white py-2 rounded font-bold hover:bg-blue-800 shadow-sm mt-2">Prescrivi</button></form></div>
                                      </div>
                                   )}
                                   {patientTab === 'note' && (
                                      <div className="h-full flex flex-col"><h3 className="text-lg font-bold text-gray-700 mb-4">Diario Clinico e Note Mediche</h3><p className="text-sm text-gray-500 mb-2">Scrivi qui le tue osservazioni. Verranno incluse automaticamente nel PDF.</p><textarea className="w-full flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d47a1] outline-none min-h-[300px] text-gray-800 leading-relaxed resize-none shadow-sm" placeholder="Esempio: Il paziente riferisce un miglioramento..." value={visitNote} onChange={e => setVisitNote(e.target.value)}></textarea><div className="mt-4 flex justify-end"><button onClick={handleSaveNote} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition"><Save size={20}/> Salva e Aggiorna Referto</button></div></div>
                                   )}
                                </div>
                            </div>
                        </div>
                    ) : (<div className="h-full flex flex-col items-center justify-center text-gray-400"><User size={64} className="mb-4 text-blue-200"/><p className="text-lg font-medium">Seleziona un paziente dalla lista a sinistra.</p></div>)}
                </div>
            </div>
          )}

          {activePage === 'profilo' && (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 mt-10">
                <h2 className="text-2xl font-bold text-[#0d47a1] mb-6 flex items-center gap-2"><User size={28}/> Profilo Medico</h2>
                <div className="space-y-4 mb-8">
                    <div><label className="text-xs font-bold text-gray-400">NOME</label><p className="font-bold text-lg">{user.name}</p></div>
                    <div><label className="text-xs font-bold text-gray-400">EMAIL</label><p className="font-bold text-lg">{user.email}</p></div>
                    <div><label className="text-xs font-bold text-gray-400">SPECIALIZZAZIONE</label><p className="font-bold text-lg">{user.spec}</p></div>
                </div>
                <div className="border-t pt-6">
                    <h3 className="font-bold text-gray-800 mb-4">Modifica Password</h3>
                    <div className="space-y-3">
                        <input type="password" placeholder="Vecchia Password" className="w-full p-3 border rounded" value={pwdData.old} onChange={e => setPwdData({...pwdData, old: e.target.value})} />
                        <input type="password" placeholder="Nuova Password" className="w-full p-3 border rounded" value={pwdData.new} onChange={e => setPwdData({...pwdData, new: e.target.value})} />
                        <button onClick={handleChangePassword} className="w-full bg-[#0d47a1] text-white py-2 rounded font-bold hover:bg-blue-800">Salva Nuova Password</button>
                    </div>
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
const VitalCard = ({ icon, label, value, unit }) => (<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"><div><p className="text-xs font-bold text-gray-400 uppercase">{label}</p><p className="text-2xl font-bold text-gray-800">{value} <span className="text-sm font-normal text-gray-500">{unit}</span></p></div><div className="p-3 bg-gray-50 rounded-full">{icon}</div></div>);
const TabButton = ({ active, onClick, icon, text }) => (<button onClick={onClick} className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition ${active ? 'border-[#0d47a1] text-[#0d47a1] bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>{icon} {text}</button>);
const SidebarItem = ({ icon, text, active, onClick, badge }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${active ? 'text-[#0d47a1] bg-blue-50 border-r-4 border-[#0d47a1]' : 'text-gray-600 hover:bg-gray-100'}`}>
        <div className="flex items-center gap-3">
            {icon} <span>{text}</span>
        </div>
        {badge > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
);
export default DoctorDashboard;