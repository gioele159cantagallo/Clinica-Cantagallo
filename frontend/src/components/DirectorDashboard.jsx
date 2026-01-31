import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { 
  LayoutDashboard, Users, UserPlus, Calendar, Settings, LogOut, 
  User, Mail, Lock, Stethoscope, ChevronLeft, ChevronRight, Trash2, Briefcase, 
  MessageSquare, Edit, Euro, List, Search, Megaphone, XCircle, Download
} from 'lucide-react';

const DirectorDashboard = ({ onLogout, user }) => {
  const [activePage, setActivePage] = useState('dashboard');
  
  // 
  const [doctors, setDoctors] = useState([]);
  const [applications, setApplications] = useState([]); 
  const [messages, setMessages] = useState([]); 
  const [appointmentsList, setAppointmentsList] = useState([]); 
  const [calendarData, setCalendarData] = useState({}); 
  
  // 
  const [docForm, setDocForm] = useState({ id: null, name: '', spec: '', email: '', password: '', hourly_rate: 50 });
  const [isEditing, setIsEditing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [pwdData, setPwdData] = useState({ old: '', new: '' });
  
  // 
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueBySpec, setRevenueBySpec] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  
  // Ricerca prenotazioni
  const [searchApp, setSearchApp] = useState("");

  // Colori grafica
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#d32f2f', '#8884d8'];

  useEffect(() => { 
      fetchDoctors(); 
      fetchAppointments(); 
      fetchApplications(); 
      fetchMessages(); 
  }, []);

  useEffect(() => { calculateMetrics(); }, [doctors, appointmentsList]);

  // --- Chiamate Api  ---
  const fetchDoctors = async () => { try { const res = await fetch('http://127.0.0.1:8000/api/doctors'); if (res.ok) setDoctors(await res.json()); } catch (e) { console.error(e); } };
  
  const fetchAppointments = async () => { 
      try { 
          const res = await fetch('http://127.0.0.1:8000/api/appointments/dottore@clinica.it'); 
          if (res.ok) { 
              const data = await res.json(); 
              setAppointmentsList(data); 
              const map = {}; 
              data.forEach(app => { 
                  const dateObj = new Date(app.date);
                  const key = `${dateObj.getMonth()}-${dateObj.getDate()}`; 
                  if (!map[key]) map[key] = []; 
                  map[key].push(app); 
              }); 
              setCalendarData(map); 
          } 
      } catch (e) { console.error(e); } 
  };
  
  const fetchApplications = async () => { 
      try { 
          const res = await fetch('http://127.0.0.1:8000/api/applications'); 
          if (res.ok) {
              const data = await res.json();
              setApplications(Array.isArray(data) ? data : []); 
          }
      } catch (e) { console.error("Errore fetch candidature:", e); setApplications([]); } 
  };

  const fetchMessages = async () => { try { const res = await fetch('http://127.0.0.1:8000/api/messages'); if (res.ok) setMessages(await res.json()); } catch (e) { console.error(e); } };

  //calcoli tariffa dottori = fatturato 
  const calculateMetrics = () => {
      let total = 0;
      const specMap = {};

      appointmentsList.forEach(app => {
          const doc = doctors.find(d => d.email === app.doctor_email);
          if (doc && doc.hourly_rate) {
              const amount = doc.hourly_rate;
              total += amount;
              const spec = doc.spec || "Altro";
              if (!specMap[spec]) specMap[spec] = 0;
              specMap[spec] += amount;
          }
      });
      
      setTotalRevenue(total);
      
      const chartData = Object.keys(specMap).map(key => ({
          name: key,
          value: specMap[key]
      }));
      setRevenueBySpec(chartData);
  };

  const getDoctorWorkload = () => {
      const workload = {};
      appointmentsList.forEach(app => {
          const docEmail = app.doctor_email;
          if(!workload[docEmail]) workload[docEmail] = { count: 0, revenue: 0, name: "Sconosciuto" };
          workload[docEmail].count += 1;
          const doc = doctors.find(d => d.email === docEmail);
          if(doc) {
              workload[docEmail].name = doc.name;
              workload[docEmail].revenue += (doc.hourly_rate || 0);
          }
      });
      return Object.values(workload);
  };

  // azioni
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!docForm.name || !docForm.spec || !docForm.email || !docForm.password) return alert("Compila tutti i campi!");
    const url = isEditing ? `http://127.0.0.1:8000/api/doctors/${docForm.id}` : 'http://127.0.0.1:8000/api/doctors';
    const method = isEditing ? 'PUT' : 'POST';
    try { 
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(docForm) }); 
        if (res.ok) { alert("Operazione completata!"); setDocForm({ id: null, name: '', spec: '', email: '', password: '', hourly_rate: 50 }); setIsEditing(false); fetchDoctors(); } 
    } catch (e) { alert("Errore"); }
  };

  const startEditDoctor = (doc) => { setDocForm(doc); setIsEditing(true); setActivePage('staff'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleFireDoctor = async (id) => { if(!window.confirm("Rimuovere definitivamente?")) return; try { await fetch(`http://127.0.0.1:8000/api/doctors/${id}`, { method: 'DELETE' }); fetchDoctors(); } catch (e) { alert("Errore"); } };
  
  const handleAnnouncement = async () => {
      if(!announcement) return;
      try {
          await fetch('http://127.0.0.1:8000/api/announcements', {
              method: 'POST', headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ text: announcement, date: new Date().toLocaleDateString() })
          });
          alert("Avviso pubblicato sulla bacheca!");
          setAnnouncement("");
      } catch(e) { alert("Errore invio avviso"); }
  };

  const deleteAppointment = async (id) => {
      if(!window.confirm("Cancellare questa prenotazione? Il paziente dovrà riprenotare.")) return;
      try {
          await fetch(`http://127.0.0.1:8000/api/appointments/${id}`, { method: 'DELETE' });
          fetchAppointments();
      } catch(e) { alert("Errore cancellazione"); }
  };

  const handleChangePassword = async (e) => { e.preventDefault(); if (!pwdData.old || !pwdData.new) return alert("Compila i campi"); try { const res = await fetch('http://127.0.0.1:8000/api/update-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: "admin@clinica.it", old_password: pwdData.old, new_password: pwdData.new, role: "direttore" }) }); if (res.ok) { alert("Password aggiornata!"); setPwdData({ old: '', new: '' }); } else { const d = await res.json(); alert(d.detail); } } catch (err) { alert("Errore"); } };

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filtro prenotazioni 
  const filteredAppointments = appointmentsList.filter(app => 
      (app.patient_name || "").toLowerCase().includes(searchApp.toLowerCase()) ||
      (app.doctor_email || "").toLowerCase().includes(searchApp.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-[#f8f9fa] border-r border-gray-200 flex flex-col z-10">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-white"><span className="text-gray-500 font-bold text-xs tracking-widest uppercase">Area Direzione</span></div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={18}/>} text="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <SidebarItem icon={<Users size={18}/>} text="Staff Medico" active={activePage === 'staff'} onClick={() => setActivePage('staff')} />
          <SidebarItem icon={<Calendar size={18}/>} text="Turni e Copertura" active={activePage === 'calendario'} onClick={() => setActivePage('calendario')} />
          <SidebarItem icon={<List size={18}/>} text="Prenotazioni Globali" active={activePage === 'prenotazioni'} onClick={() => setActivePage('prenotazioni')} />
          <SidebarItem icon={<Briefcase size={18}/>} text="HR & Candidature" active={activePage === 'candidature'} onClick={() => setActivePage('candidature')} />
          <SidebarItem icon={<MessageSquare size={18}/>} text="Richieste Help" active={activePage === 'messaggi'} onClick={() => setActivePage('messaggi')} />
          <SidebarItem icon={<Settings size={18}/>} text="Profilo" active={activePage === 'profilo'} onClick={() => setActivePage('profilo')} />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[#0d47a1] text-white flex items-center justify-between px-6 shadow-md z-20">
          <h1 className="font-bold text-lg tracking-wide uppercase">Clinica Privata Cantagallo</h1>
          <div className="flex items-center gap-4"><div className="text-right hidden md:block"><p className="text-sm font-bold">Dr. Cantagallo</p><p className="text-xs text-blue-200">Direttore Sanitario</p></div><button onClick={onLogout} className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2"><LogOut size={16} /> Logout</button></div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          
          {/* DASHBOARD */}
          {activePage === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <KPICard title="Fatturato Mensile Stimato" value={`€ ${totalRevenue.toLocaleString()}`} color="bg-[#2e7d32]" />
                  <KPICard title="Visite Totali Prenotate" value={appointmentsList.length} color="bg-[#1976d2]" />
                  <KPICard title="Medici in Organico" value={doctors.length} color="bg-[#f9a825]" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Euro size={18}/> Fatturato per Reparto</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueBySpec} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                                <Tooltip formatter={(value) => `€ ${value}`} />
                                <Bar dataKey="value" fill="#0d47a1" barSize={25} radius={[0, 4, 4, 0]} name="Ricavi" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Megaphone size={18}/> Bacheca Staff</h3>
                    <textarea className="w-full flex-1 p-3 border rounded-lg bg-gray-50 text-sm mb-3 resize-none focus:ring-2 focus:ring-[#0d47a1] outline-none" placeholder="Scrivi un avviso per tutti i medici..." value={announcement} onChange={e => setAnnouncement(e.target.value)}></textarea>
                    <button onClick={handleAnnouncement} className="w-full bg-[#0d47a1] text-white py-2 rounded font-bold text-sm hover:bg-blue-800 transition">Pubblica Avviso</button>
                </div>
              </div>
            </div>
          )}

          {/* Gestione staff */}
          {activePage === 'staff' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
              <div className="xl:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="bg-blue-50 p-2 rounded-full text-[#0d47a1]">{isEditing ? <Edit size={24}/> : <UserPlus size={24}/>}</div>
                        <h3 className="font-bold text-gray-800 text-lg">{isEditing ? "Modifica Dati Medico" : "Nuova Assunzione"}</h3>
                    </div>
                    <form onSubmit={handleDoctorSubmit} className="space-y-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label><div className="relative mt-1"><User className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" className="w-full pl-9 p-2 border rounded focus:ring-2 focus:ring-[#0d47a1] outline-none" value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})} /></div></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Specializzazione</label><div className="relative mt-1"><Stethoscope className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" className="w-full pl-9 p-2 border rounded bg-white focus:ring-2 focus:ring-[#0d47a1] outline-none" value={docForm.spec} onChange={e => setDocForm({...docForm, spec: e.target.value})} /></div></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Tariffa Oraria (€)</label><div className="relative mt-1"><Euro className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="number" className="w-full pl-9 p-2 border rounded bg-white focus:ring-2 focus:ring-[#0d47a1] outline-none" value={docForm.hourly_rate} onChange={e => setDocForm({...docForm, hourly_rate: parseFloat(e.target.value)})} /></div></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Email Aziendale</label><div className="relative mt-1"><Mail className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="email" className="w-full pl-9 p-2 border rounded focus:ring-2 focus:ring-[#0d47a1] outline-none" value={docForm.email} onChange={e => setDocForm({...docForm, email: e.target.value})} /></div></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Password</label><div className="relative mt-1"><Lock className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="password" className="w-full pl-9 p-2 border rounded focus:ring-2 focus:ring-[#0d47a1] outline-none" value={docForm.password} onChange={e => setDocForm({...docForm, password: e.target.value})} /></div></div>
                        <div className="flex gap-2 pt-2">
                            <button type="submit" className="flex-1 bg-[#0d47a1] hover:bg-blue-800 text-white font-bold py-2 rounded shadow-md transition">{isEditing ? "Salva Modifiche" : "Conferma Assunzione"}</button>
                            {isEditing && <button type="button" onClick={() => {setIsEditing(false); setDocForm({ id: null, name: '', spec: '', email: '', password: '', hourly_rate: 50 });}} className="px-4 py-2 border rounded bg-gray-100 text-gray-600 hover:bg-gray-200">Annulla</button>}
                        </div>
                    </form>
                </div>
              </div>
              <div className="xl:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex justify-between"><h3 className="font-bold text-gray-700">Organico Attuale</h3><span className="bg-blue-100 text-[#0d47a1] text-xs font-bold px-2 py-1 rounded-full">{doctors.length} Medici</span></div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 uppercase text-xs text-gray-600"><tr><th className="px-4 py-3">Medico</th><th className="px-4 py-3">Reparto</th><th className="px-4 py-3">Tariffa</th><th className="px-4 py-3">Contatti</th><th className="px-4 py-3 text-right">Azioni</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">{doctors.map((doc) => (<tr key={doc.id} className="hover:bg-blue-50/30"><td className="px-4 py-3 font-bold text-gray-800 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-blue-100 text-[#0d47a1] flex items-center justify-center font-bold text-xs">{doc.name.charAt(0)}</div>{doc.name}</td><td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">{doc.spec}</span></td><td className="px-4 py-3 font-bold text-green-700">€ {doc.hourly_rate}</td><td className="px-4 py-3 text-gray-500">{doc.email}</td><td className="px-4 py-3 text-right"><button onClick={() => startEditDoctor(doc)} className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded mr-2"><Edit size={16}/></button><button onClick={() => handleFireDoctor(doc.id)} className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"><Trash2 size={16}/></button></td></tr>))}</tbody>
                    </table>
                </div>
              </div>
            </div>
          )}

          {/* Calendario e turni  */}
          {activePage === 'calendario' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
                <div className="xl:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2 text-[#0d47a1]"><Calendar size={24} /><h2 className="text-2xl font-bold text-gray-800">Turni e Copertura</h2></div>
                            <div className="flex items-center gap-4"><span className="text-xl font-bold capitalize text-gray-700">{currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}</span><div className="flex bg-gray-100 rounded-md"><button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-l"><ChevronLeft size={20}/></button><button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 text-sm font-bold bg-white shadow-sm">Oggi</button><button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-r"><ChevronRight size={20}/></button></div></div>
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="grid grid-cols-7 bg-blue-50 border-b border-gray-200 text-center py-2 text-sm font-bold text-[#0d47a1] uppercase"><div>Lun</div><div>Mar</div><div>Mer</div><div>Gio</div><div>Ven</div><div>Sab</div><div>Dom</div></div>
                            <div className="grid grid-cols-7 bg-white">
                                {calendarDays.map((day) => { 
                                    const key = `${currentDate.getMonth()}-${day}`; 
                                    const appsToday = calendarData[key] || []; 
                                    const doctorsOnDuty = {};
                                    appsToday.forEach(app => {
                                        const docInfo = doctors.find(d => d.email === app.doctor_email);
                                        const docName = docInfo ? docInfo.name.split(' ').pop() : 'Dottore';
                                        if (!doctorsOnDuty[app.doctor_email]) doctorsOnDuty[app.doctor_email] = { name: docName, count: 0 };
                                        doctorsOnDuty[app.doctor_email].count += 1;
                                    });
                                    return (
                                        <div key={day} className="min-h-[120px] border-r border-b border-gray-100 p-2 relative hover:bg-gray-50 transition">
                                            <span className={`text-sm font-bold absolute top-2 right-2 ${appsToday.length > 0 ? 'text-[#0d47a1]' : 'text-gray-400'}`}>{day}</span>
                                            <div className="mt-6 space-y-1">
                                                {Object.values(doctorsOnDuty).map((doc, i) => (<div key={i} className="text-xs flex justify-between items-center bg-green-50 text-green-800 p-1.5 rounded border border-green-200 font-medium mb-1"><span className="truncate font-bold">Dr. {doc.name}</span><span className="bg-green-200 text-green-900 px-1.5 rounded-full text-[10px]">{doc.count}</span></div>))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="xl:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full sticky top-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Settings size={18}/> Carico Mensile & Ricavi</h3>
                        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
                            {getDoctorWorkload().length > 0 ? getDoctorWorkload().map((item, idx) => (<div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 transition"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 text-[#0d47a1] flex items-center justify-center font-bold text-xs">{item.name.charAt(0)}</div><div><p className="font-bold text-gray-800 text-sm">{item.name}</p><p className="text-xs text-gray-500">{item.count} Visite Prenotate</p></div></div><div className="text-right"><p className="font-bold text-green-700 text-sm">€ {item.revenue}</p><p className="text-[10px] text-gray-400 uppercase tracking-wider">Fatturato</p></div></div>)) : <p className="text-gray-400 italic text-sm text-center py-4">Nessun dato per questo periodo.</p>}
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* Tabella prenotazioni  */}
          {activePage === 'prenotazioni' && (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3"><div className="bg-blue-50 p-2 rounded-full text-[#0d47a1]"><List size={24}/></div><h2 className="text-2xl font-bold text-gray-800">Master Prenotazioni</h2></div>
                    <div className="relative"><Search size={16} className="absolute left-3 top-2.5 text-gray-400"/><input type="text" placeholder="Cerca paziente o dottore..." className="pl-9 p-2 border rounded-lg bg-white w-64" value={searchApp} onChange={e => setSearchApp(e.target.value)}/></div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 uppercase text-xs text-gray-600"><tr><th className="px-6 py-4">Data/Ora</th><th className="px-6 py-4">Paziente</th><th className="px-6 py-4">Dottore / Reparto</th><th className="px-6 py-4 text-center">Stato</th><th className="px-6 py-4 text-right">Azioni</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAppointments.length > 0 ? filteredAppointments.map(app => (
                                <tr key={app.id} className="hover:bg-blue-50/30">
                                    <td className="px-6 py-4 font-medium text-gray-700">{app.date} <span className="text-gray-400 mx-1">|</span> {app.time}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{app.patient_name}</td>
                                    <td className="px-6 py-4"><p className="text-gray-800">{app.doctor_email}</p><p className="text-xs text-[#0d47a1] font-bold uppercase">{app.type}</p></td>
                                    <td className="px-6 py-4 text-center"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{app.status}</span></td>
                                    <td className="px-6 py-4 text-right"><button onClick={() => deleteAppointment(app.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded flex items-center gap-1 ml-auto"><XCircle size={16}/> Cancella</button></td>
                                </tr>
                            )) : <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">Nessuna prenotazione trovata.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {/* Candidature lavora con noi */}
          {activePage === 'candidature' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6"><div className="bg-blue-50 p-2 rounded-full text-[#0d47a1]"><Briefcase size={24}/></div><h2 className="text-2xl font-bold text-gray-800">Candidature Ricevute</h2></div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 uppercase text-xs text-gray-600"><tr><th className="px-6 py-4">Data</th><th className="px-6 py-4">Candidato</th><th className="px-6 py-4">Posizione</th><th className="px-6 py-4">Messaggio</th><th className="px-6 py-4">CV</th><th className="px-6 py-4">Contatti</th></tr></thead>
                      <tbody className="divide-y divide-gray-100">
                          {applications && Array.isArray(applications) && applications.length > 0 ? applications.map((app, index) => (
                              <tr key={app.id || index} className="hover:bg-blue-50/30">
                                  <td className="px-6 py-4 font-medium text-gray-500">{app.date || "-"}</td>
                                  <td className="px-6 py-4 font-bold text-gray-800">{app.name || "Sconosciuto"}</td>
                                  <td className="px-6 py-4"><span className="bg-blue-100 text-[#0d47a1] px-2 py-1 rounded text-xs font-bold">{app.position || "-"}</span></td>
                                  <td className="px-6 py-4 text-gray-600 italic truncate max-w-xs">{app.message || ""}</td>
                                  <td className="px-6 py-4">
                                      {app.cv_path ? (
                                          <a href={`http://127.0.0.1:8000${app.cv_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><Download size={14}/> Scarica</a>
                                      ) : <span className="text-gray-400">Nessun file</span>}
                                  </td>
                                  <td className="px-6 py-4 text-gray-500"><div className="flex flex-col"><span>{app.email}</span><span className="text-xs">{app.phone}</span></div></td>
                              </tr>
                          )) : (<tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">Nessuna candidatura ricevuta.</td></tr>)}
                      </tbody>
                  </table>
              </div>
            </div>
          )}

          {/* Messaggi Help */}
          {activePage === 'messaggi' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6"><div className="bg-blue-50 p-2 rounded-full text-[#0d47a1]"><MessageSquare size={24}/></div><h2 className="text-2xl font-bold text-gray-800">Richieste Help & Contatti</h2></div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 uppercase text-xs text-gray-600"><tr><th className="px-6 py-4">Data</th><th className="px-6 py-4">Utente</th><th className="px-6 py-4">Messaggio</th><th className="px-6 py-4">Email</th></tr></thead>
                      <tbody className="divide-y divide-gray-100">
                          {messages && messages.length > 0 ? messages.map((msg) => (
                              <tr key={msg.id} className="hover:bg-blue-50/30">
                                  <td className="px-6 py-4 font-medium text-gray-500">{msg.date}</td>
                                  <td className="px-6 py-4 font-bold text-gray-800">{msg.first_name} {msg.last_name}</td>
                                  <td className="px-6 py-4 text-gray-600">{msg.text}</td>
                                  <td className="px-6 py-4 text-blue-600">{msg.email}</td>
                              </tr>
                          )) : (<tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Nessun messaggio ricevuto.</td></tr>)}
                      </tbody>
                  </table>
              </div>
            </div>
          )}

          {/* Profilo admin */}
          {activePage === 'profilo' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 animate-fade-in">
               <div className="text-center mb-8"><div className="w-24 h-24 bg-[#0d47a1] rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4">DC</div><h2 className="text-2xl font-bold text-gray-800">Dott. Cantagallo</h2><p className="text-gray-500 font-medium">Direttore Sanitario</p></div>
               <div className="grid grid-cols-2 gap-4 mb-8"><div className="p-4 bg-gray-50 rounded border border-gray-100"><label className="text-xs font-bold text-gray-400 uppercase">Email</label><p className="font-bold text-gray-700">admin@clinica.it</p></div><div className="p-4 bg-gray-50 rounded border border-gray-100"><label className="text-xs font-bold text-gray-400 uppercase">Ruolo</label><p className="font-bold text-gray-700">Super Admin</p></div></div>
               <div className="border-t pt-6"><h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Lock size={18}/> Sicurezza Account</h3><div className="space-y-3"><input type="password" placeholder="Vecchia Password" className="w-full p-3 border rounded bg-gray-50" value={pwdData.old} onChange={e => setPwdData({...pwdData, old: e.target.value})} /><input type="password" placeholder="Nuova Password" className="w-full p-3 border rounded bg-gray-50" value={pwdData.new} onChange={e => setPwdData({...pwdData, new: e.target.value})} /><button onClick={handleChangePassword} className="w-full bg-gray-800 text-white py-2 rounded font-bold hover:bg-black transition">Aggiorna Password</button></div></div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
const SidebarItem = ({ icon, text, active, onClick }) => (<button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${active ? 'text-[#0d47a1] bg-blue-50 border-r-4 border-[#0d47a1]' : 'text-gray-600 hover:bg-gray-100'}`}>{icon} <span>{text}</span></button>);
const KPICard = ({ title, value, color }) => (<div className={`${color} rounded-lg p-6 text-white shadow-md flex flex-col justify-center items-center`}><p className="text-sm font-medium opacity-90 mb-1">{title}</p><h3 className="text-4xl font-bold">{value}</h3></div>);
export default DirectorDashboard;