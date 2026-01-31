import React, { useState, useEffect } from 'react';
import { 
  Calendar, FileText, ChevronRight, ChevronLeft, Download, CheckCircle, LogOut, User, Clock, Lock
} from 'lucide-react';

const PatientDashboard = ({ onLogout, user }) => {
  const [activePage, setActivePage] = useState('prenota');
  const [step, setStep] = useState(1); 
  
  const times = ["09:00", "10:30", "11:00", "14:30", "16:00", "17:30"];
  const [doctorsList, setDoctorsList] = useState([]);
  const [booking, setBooking] = useState({ spec: '', doc: '', doc_email: '', date: '', time: '' });
  const [currentDate, setCurrentDate] = useState(new Date());

  const [pwdData, setPwdData] = useState({ old: '', new: '' });

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/doctors');
      if (res.ok) setDoctorsList(await res.json());
    } catch (e) { console.error(e); }
  };

  const availableSpecializations = [...new Set(doctorsList.map(doc => doc.spec).filter(Boolean))];
  const filteredDoctors = doctorsList.filter(doc => doc.spec && doc.spec.toLowerCase() === booking.spec.toLowerCase());
  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDateSelect = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setBooking({ ...booking, date: `${year}-${month}-${dayStr}` });
    setStep(4);
  };

  const handleConfirmBooking = async (selectedTime) => {
    const payload = {
      doctor_email: booking.doc_email,
      patient_email: user.email, 
      patient_name: user.name,   
      date: booking.date,
      time: selectedTime,
      type: booking.spec,
      status: "In Attesa"
    };
    try {
      const res = await fetch('http://127.0.0.1:8000/api/appointments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (res.ok) { setBooking({ ...booking, time: selectedTime }); setStep(5); }
      else alert("Errore server");
    } catch (e) { alert("Errore connessione"); }
  };

  const handleChangePassword = async () => {
    if (!pwdData.old || !pwdData.new) return alert("Compila i campi password");
    try {
        const res = await fetch('http://127.0.0.1:8000/api/update-password', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, old_password: pwdData.old, new_password: pwdData.new, role: "paziente" })
        });
        if (res.ok) { alert("Password aggiornata!"); setPwdData({ old: '', new: '' }); }
        else { const d = await res.json(); alert(d.detail); }
    } catch (err) { alert("Errore connessione"); }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-[#f8f9fa] border-r border-gray-200 flex flex-col z-10">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-white">
           <span className="text-gray-500 font-bold text-xs tracking-widest uppercase">Area Paziente</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<Calendar size={18}/>} text="Prenota Visita" active={activePage === 'prenota'} onClick={() => setActivePage('prenota')} />
          <SidebarItem icon={<FileText size={18}/>} text="I Miei Referti" active={activePage === 'referti'} onClick={() => setActivePage('referti')} />
          <SidebarItem icon={<User size={18}/>} text="Il Mio Profilo" active={activePage === 'profilo'} onClick={() => setActivePage('profilo')} />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[#0d47a1] text-white flex items-center justify-between px-6 shadow-md z-20">
          <h1 className="font-bold text-lg tracking-wide uppercase">Clinica Privata Cantagallo</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold">Benvenuto, {user.name}</span>
            <button onClick={onLogout} className="bg-white/10 px-3 py-1 rounded text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition"><LogOut size={16} /> Esci</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activePage === 'prenota' && (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 animate-fade-in">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4"><div className="bg-blue-50 p-2 rounded-full text-[#0d47a1]"><Calendar size={24}/></div><h2 className="text-2xl font-bold text-gray-800">Nuova Prenotazione</h2></div>
              <div className="flex items-center justify-between mb-8 px-4 relative"><div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-100 -z-10"></div>{['Specialità', 'Medico', 'Data', 'Ora'].map((label, idx) => { const n = idx + 1; return (<div key={n} className="flex flex-col items-center bg-white px-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 ${step >= n ? 'bg-[#0d47a1] text-white' : 'bg-gray-200 text-gray-500'}`}>{n}</div><span className="text-xs font-bold text-gray-500">{label}</span></div>);})}</div>
              {step === 1 && (<div className="space-y-4"><h3 className="font-bold text-gray-700 mb-2">Di quale specialista hai bisogno?</h3>{availableSpecializations.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{availableSpecializations.map(spec => (<button key={spec} onClick={() => {setBooking({...booking, spec}); setStep(2)}} className="p-6 border rounded-xl hover:border-[#0d47a1] hover:bg-blue-50 font-bold text-gray-700 text-left transition capitalize">{spec}</button>))}</div>) : (<div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300"><p className="text-gray-500">Nessun medico disponibile.</p></div>)}</div>)}
              {step === 2 && (<div className="space-y-4"><h3 className="font-bold text-gray-700 mb-2">Medici per {booking.spec}:</h3>{filteredDoctors.map(doc => (<div key={doc.id} onClick={() => {setBooking({...booking, doc: doc.name, doc_email: doc.email}); setStep(3)}} className="p-4 border rounded-xl flex items-center gap-4 hover:border-[#0d47a1] cursor-pointer hover:bg-blue-50 transition"><div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-[#0d47a1] text-lg">{doc.name.charAt(0)}</div><div><h3 className="font-bold text-gray-800 text-lg">{doc.name}</h3><p className="text-sm text-gray-500">{doc.spec} • {doc.email}</p></div><ChevronRight className="ml-auto text-gray-400"/></div>))}<button onClick={() => setStep(1)} className="text-gray-400 text-sm hover:underline mt-4">Indietro</button></div>)}
              {step === 3 && (<div className="space-y-6"><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-700">Seleziona una data:</h3><div className="flex items-center gap-4"><button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft/></button><span className="font-bold capitalize">{currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}</span><button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronRight/></button></div></div><div className="border rounded-lg overflow-hidden"><div className="grid grid-cols-7 bg-blue-50 text-center py-2 text-xs font-bold text-[#0d47a1] uppercase border-b"><div>Lun</div><div>Mar</div><div>Mer</div><div>Gio</div><div>Ven</div><div>Sab</div><div>Dom</div></div><div className="grid grid-cols-7 bg-white">{calendarDays.map(day => (<button key={day} onClick={() => handleDateSelect(day)} className="h-14 border-r border-b border-gray-100 hover:bg-[#0d47a1] hover:text-white transition font-medium text-gray-600 focus:bg-[#0d47a1] focus:text-white">{day}</button>))}</div></div><button onClick={() => setStep(2)} className="text-gray-400 text-sm hover:underline mt-4">Indietro</button></div>)}
              {step === 4 && (<div className="space-y-6"><h3 className="font-bold text-gray-700">Disponibilità per il {booking.date}:</h3><div className="grid grid-cols-3 gap-3">{times.map(time => (<button key={time} onClick={() => handleConfirmBooking(time)} className="py-3 border rounded-lg hover:bg-[#0d47a1] hover:text-white font-bold text-gray-600 transition flex items-center justify-center gap-2"><Clock size={16}/> {time}</button>))}</div><button onClick={() => setStep(3)} className="text-gray-400 text-sm hover:underline mt-4">Indietro</button></div>)}
              {step === 5 && (<div className="text-center py-10"><div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div><h2 className="text-2xl font-bold text-gray-800 mb-2">Prenotazione Confermata!</h2><p className="text-gray-600 mb-8">Visita con <strong>{booking.doc}</strong><br/>il {booking.date} alle {booking.time}</p><button onClick={() => {setStep(1); setActivePage('referti')}} className="bg-[#0d47a1] text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-800 transition">Visualizza Referti</button></div>)}
            </div>
          )}

          {activePage === 'referti' && (
             <div className="max-w-5xl mx-auto space-y-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                    <div><h3 className="font-bold text-gray-800 text-lg">Visita Cardiologica</h3><p className="text-sm text-gray-500">20/01/2026 • Dott. Cantagallo</p></div>
                    <button onClick={() => window.open(`http://127.0.0.1:8000/download-referto/${user.email}`, '_blank')} className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#0d47a1] hover:text-white transition"><Download size={18} /> Scarica PDF</button>
                </div>
             </div>
          )}

          {activePage === 'profilo' && (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 mt-10 animate-fade-in">
                <h2 className="text-2xl font-bold text-[#0d47a1] mb-6 flex items-center gap-2"><User size={28}/> I Miei Dati</h2>
                <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-100">
                    <p className="text-sm text-gray-500 mb-1">Paziente</p>
                    <p className="font-bold text-xl text-[#0d47a1]">{user.name}</p>
                    <p className="text-gray-600">{user.email}</p>
                </div>
                <div className="border-t pt-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Lock size={18}/> Modifica Password</h3>
                    <div className="space-y-3">
                        <input type="password" placeholder="Password Attuale" className="w-full p-3 border rounded focus:ring-2 focus:ring-[#0d47a1] outline-none" value={pwdData.old} onChange={e => setPwdData({...pwdData, old: e.target.value})} />
                        <input type="password" placeholder="Nuova Password" className="w-full p-3 border rounded focus:ring-2 focus:ring-[#0d47a1] outline-none" value={pwdData.new} onChange={e => setPwdData({...pwdData, new: e.target.value})} />
                        <button onClick={handleChangePassword} className="w-full bg-[#0d47a1] text-white py-3 rounded font-bold hover:bg-blue-800 shadow-lg transition">Aggiorna Password</button>
                    </div>
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
const SidebarItem = ({ icon, text, active, onClick }) => (<button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${active ? 'text-[#0d47a1] bg-blue-50 border-r-4 border-[#0d47a1]' : 'text-gray-600 hover:bg-gray-100'}`}>{icon} <span>{text}</span></button>);
export default PatientDashboard;
