import React, { useState } from 'react';
import { 
  Phone, Mail, MapPin, Activity, Calendar, FileText, Users, ArrowRight, LogIn, ChevronRight
} from 'lucide-react';
import { SectionAzienda, SectionReparti, SectionMedici, SectionContatti, SectionLavoraConNoi } from './PublicPages';

const HomePage = ({ onEnter }) => {
  const [currentView, setCurrentView] = useState('home');

  // Funzione per tornare alla home 
  const goHome = () => setCurrentView('home');

  return (
    <div className="font-sans text-gray-700 flex flex-col min-h-screen">
      
      {/* Barra superiore */}
      <div className="bg-[#0a2e5c] text-white text-xs py-2 px-6 flex justify-between items-center">
        <div className="flex gap-4">
          <span className="flex items-center gap-1 hover:text-blue-200 cursor-pointer">
            <Phone size={14}/> +39 392 078 0712
          </span>
          <span className="flex items-center gap-1 hover:text-blue-200 cursor-pointer">
            <Mail size={14}/> cantagallogioele@gmail.com
          </span>
        </div>
        <div className="flex gap-4">
          <span 
            onClick={() => setCurrentView('lavora')} 
            className="hover:underline cursor-pointer font-bold text-blue-200"
          >
            Lavora con noi
          </span>
        </div>
      </div>

      {/* header + navigazione */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={goHome}>
            <div className="bg-[#0d47a1] text-white p-2 rounded-lg">
              <Activity size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0d47a1] leading-none uppercase tracking-wide">
                Clinica Cantagallo
              </h1>
              <p className="text-xs text-gray-500 font-medium tracking-widest uppercase">
                Eccellenza Medica
              </p>
            </div>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600">
            <button 
              onClick={() => setCurrentView('azienda')} 
              className={`hover:text-[#0d47a1] transition ${currentView === 'azienda' ? 'text-[#0d47a1] font-bold' : ''}`}
            >
              L'AZIENDA
            </button>
            <button 
              onClick={() => setCurrentView('reparti')} 
              className={`hover:text-[#0d47a1] transition ${currentView === 'reparti' ? 'text-[#0d47a1] font-bold' : ''}`}
            >
              REPARTI
            </button>
            <button 
              onClick={() => setCurrentView('medici')} 
              className={`hover:text-[#0d47a1] transition ${currentView === 'medici' ? 'text-[#0d47a1] font-bold' : ''}`}
            >
              MEDICI
            </button>
            <button 
              onClick={() => setCurrentView('contatti')} 
              className={`hover:text-[#0d47a1] transition ${currentView === 'contatti' ? 'text-[#0d47a1] font-bold' : ''}`}
            >
              CONTATTI
            </button>
          </nav>

          {/* Bottone x Login */}
          <button 
            onClick={onEnter} 
            className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white px-6 py-2.5 rounded-full font-bold shadow-md flex items-center gap-2 transition transform hover:scale-105"
          >
            <LogIn size={18} /> AREA RISERVATA
          </button>
        </div>
      </header>

      <div className="flex-1">
        
        {/* home page */}
        {currentView === 'home' && (
          <>
            {/* Immagine Grande */}
            <div className="relative h-[550px] bg-gray-100 flex items-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop" 
                  alt="Ospedale Background" 
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d47a1]/80 to-transparent"></div>
              </div>

              <div className="container mx-auto px-6 relative z-10 text-white max-w-2xl animate-fade-in">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block backdrop-blur-sm border border-white/30">
                  Sanità di Eccellenza
                </span>
                <h2 className="text-5xl font-extrabold mb-6 leading-tight">
                  La tua salute è la nostra <br/> <span className="text-[#90caf9]">priorità assoluta.</span>
                </h2>
                <p className="text-lg mb-8 text-blue-50 leading-relaxed">
                  Tecnologie all'avanguardia, specialisti di fama internazionale e un'attenzione costante al paziente.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={onEnter} 
                    className="bg-white text-[#0d47a1] px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition shadow-lg"
                  >
                    Prenota Visita
                  </button>
                  <button 
                    onClick={() => setCurrentView('reparti')} 
                    className="border-2 border-white text-white px-8 py-3 rounded-md font-bold hover:bg-white/10 transition"
                  >
                    Scopri i Reparti
                  </button>
                </div>
              </div>
            </div>

            {/* i 3 servizi */}
            <div className="container mx-auto px-6 -mt-16 relative z-20 mb-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ServiceCard 
                  icon={<Calendar size={32}/>} 
                  title="Prenotazioni Online" 
                  desc="Prenota visite ed esami in pochi click, 24/7."
                  color="bg-white border-t-4 border-[#0d47a1]"
                  textColor="text-gray-800"
                  onClick={onEnter}
                />
                <ServiceCard 
                  icon={<FileText size={32}/>} 
                  title="Ritiro Referti" 
                  desc="Consulta e scarica i tuoi referti medici comodamente da casa."
                  color="bg-[#0d47a1]"
                  textColor="text-white"
                  iconColor="text-white"
                  onClick={onEnter}
                />
                <ServiceCard 
                  icon={<Users size={32}/>} 
                  title="I Nostri Medici" 
                  desc="Conosci l'equipe medica e le specializzazioni della clinica."
                  color="bg-white border-t-4 border-[#d32f2f]"
                  textColor="text-gray-800"
                  onClick={() => setCurrentView('medici')}
                />
              </div>
            </div>

            {/* Perché sceglierci */}
            <div className="py-20 bg-gray-50">
              <div className="container mx-auto px-6 text-center">
                <h3 className="text-3xl font-bold text-[#0d47a1] mb-2">Perché sceglierci</h3>
                <p className="text-gray-500 max-w-2xl mx-auto mb-12">
                  Un percorso di cura personalizzato che unisce competenza clinica e umanità.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
                   <Feature number="01" title="Alta Specializzazione" desc="Tecnologie diagnostiche di ultima generazione."/>
                   <Feature number="02" title="Equipe Multidisciplinare" desc="Medici che collaborano per il tuo benessere."/>
                   <Feature number="03" title="Comfort e Accoglienza" desc="Ambienti moderni pensati per il paziente."/>
                   <Feature number="04" title="Ricerca Scientifica" desc="Sempre aggiornati sulle nuove terapie."/>
                </div>
              </div>
            </div>
          </>
        )}

        {/* pagine secondarie */}
        {currentView === 'azienda' && <SectionAzienda />}
        {currentView === 'reparti' && <SectionReparti onEnter={onEnter} />}
        {currentView === 'medici' && <SectionMedici />}
        {currentView === 'contatti' && <SectionContatti />}
        {currentView === 'lavora' && <SectionLavoraConNoi />}

      </div>

      {/* footer */}
      <footer className="bg-[#051c3b] text-white py-12 mt-auto">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm text-gray-400">
          <div>
            <div className="flex items-center gap-2 text-white mb-4">
               <Activity className="text-[#0d47a1]" /> 
               <span className="font-bold text-lg uppercase">Clinica Cantagallo</span>
            </div>
            <p>Direttore Sanitario: Dott. Cantagallo</p>
            <p>P.IVA: 01319410864</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase">Contatti</h4>
            <p className="flex items-center gap-2 mb-2"><MapPin size={16}/> Via Vittorio Fiore 28 - Troina 94018</p>
            <p className="flex items-center gap-2 mb-2"><Phone size={16}/> +39 392 078 0712</p>
            <p className="flex items-center gap-2"><Mail size={16}/> cantagallogioele@gmail.com</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase">Link Utili</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Carta dei Servizi</a></li>
              <li><a href="#" className="hover:text-white">URP</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs">
          © 2026 Clinica Privata Dott. Cantagallo - Tutti i diritti riservati.
        </div>
      </footer>

    </div>
  );
};

// altri componenti x grafica

const ServiceCard = ({ icon, title, desc, color, textColor, iconColor, onClick }) => (
  <div onClick={onClick} className={`${color} p-8 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer group`}>
    <div className={`mb-4 ${iconColor || 'text-[#0d47a1]'}`}>{icon}</div>
    <h3 className={`text-xl font-bold mb-2 ${textColor}`}>{title}</h3>
    <p className={`text-sm opacity-80 mb-4 ${textColor}`}>{desc}</p>
    <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${textColor} group-hover:underline`}>
      Accedi <ArrowRight size={16} />
    </div>
  </div>
);

const Feature = ({ number, title, desc }) => (
  <div className="p-6 bg-white border border-gray-100 rounded-xl hover:border-blue-200 transition">
    <span className="text-4xl font-bold text-gray-200 mb-2 block">{number}</span>
    <h4 className="font-bold text-[#0d47a1] text-lg mb-2">{title}</h4>
    <p className="text-sm text-gray-500">{desc}</p>
  </div>
);

export default HomePage;
