import React, { useState } from 'react';
import { User, Lock, Activity, ChevronRight, AlertCircle, UserPlus, ArrowLeft, Mail } from 'lucide-react';
import DirectorDashboard from './components/DirectorDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import HomePage from './components/HomePage'; 

function App() {
  // (False = Home, True = Modulo Login)
  const [showLogin, setShowLogin] = useState(false);
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [user, setUser] = useState(null); 
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); setError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
      });
      if (response.ok) { 
        const data = await response.json(); 
        setUser(data); 
      }
      else { setError('Credenziali non valide.'); }
    } catch (err) { setError('Errore di connessione al server.'); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError('');
    if (!name || !email || !password) return setError("Compila tutti i campi.");
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password })
      });
      if (response.ok) { setSuccessMsg("Registrazione completata! Accedi."); setIsRegistering(false); setEmail(''); setPassword(''); setName(''); }
      else { const data = await response.json(); setError(data.detail || "Errore."); }
    } catch (err) { setError('Errore di connessione.'); }
  };

  // logiche navigazione 

  // Se l'utente è loggato, mostra la Dashboard corretta
  if (user?.role === 'direttore') return <DirectorDashboard user={user} onLogout={() => setUser(null)} />;
  if (user?.role === 'dottore') return <DoctorDashboard user={user} onLogout={() => setUser(null)} />;
  if (user?.role === 'paziente') return <PatientDashboard user={user} onLogout={() => setUser(null)} />;

  // Se non è loggato e non schiaccia x il login, mostra la home page
  if (!showLogin) {
    return <HomePage onEnter={() => setShowLogin(true)} />;
  }

  // Se schiaccia x il login, mostra il modulo di login/registrazione
  return (
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative z-10 animate-fade-in border-t-4 border-[#0056b3]">
        
        {/* torna alla home */}
        <button onClick={() => setShowLogin(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-bold">
           <ArrowLeft size={16}/> Home
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="bg-blue-50 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Activity size={32} className="text-[#0056b3]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a202e]">Area Riservata</h1>
          <p className="text-gray-500 text-sm mt-2">
            {isRegistering ? "Crea il tuo account paziente" : "Accedi ai servizi online"}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2 mb-6"><AlertCircle size={16} /> {error}</div>}
        {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-6 text-center">{successMsg}</div>}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
          {isRegistering && (
            <div>
              <label className="text-sm font-semibold text-gray-700">Nome Completo</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a8cc] outline-none" placeholder="Mario Rossi" required />
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a8cc] outline-none" placeholder="esempio@clinica.it" required />
            </div>
          </div>
          <div>
             <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a8cc] outline-none" placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#0056b3] hover:bg-blue-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all">
            {isRegistering ? 'Registrati' : 'Accedi'} {isRegistering ? <UserPlus size={20}/> : <ChevronRight size={20}/>}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isRegistering ? (
            <p className="text-gray-500">Hai già un account? <button onClick={() => {setIsRegistering(false); setError('');}} className="text-[#0056b3] font-bold hover:underline">Accedi</button></p>
          ) : (
            <p className="text-gray-500">Non sei registrato? <button onClick={() => {setIsRegistering(true); setError('');}} className="text-[#00a8cc] font-bold hover:underline">Crea account</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
