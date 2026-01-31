# Gestionale "Clinica Cantagallo"

Il gestionale permette la gestione completa di quella che è la parte informatica di un'ospedale, clinica privata(come in questo caso), studi medici: dalla prenotazione degli appuntamenti, alla compilazione della cartella clinica, fino alla generazione  dei referti in pdf.

## Tecnologie Utilizzate

### Backend (API & Logica)
* **Linguaggio:** Python 3.13+
* **Framework:** FastAPI
* **Database:** Sistema di persistenza su file JSON (non ho usato SQL)
* **Librerie Chiave:** `uvicorn` (per il server), `pydantic` (per la validazione alidazione), `fpdf` (generazione PDF), `python-multipart` (caricamento file(CV, sezione "lavora con noi")).

### Frontend (Interfaccia Utente)
* **Framework:** React.js
* **Build Tool:** Vite 
* **Stile:** Tailwind CSS / CSS Modules
* **Librerie:** React Router.

---

### PASSO 1: Configurazione Backend (Terminale 1)
server API sulla porta `8000`.

1.  Aprire nuovo terminale ed entrare nella cartella del backend:
    ```bash
    cd Backend
    ```

2.  Installare le dipendenze necessarie:
    ```bash
    # Su Mac/Linux:
    python3 -m pip install -r requirements.txt
    
    # Su Windows:
    pip install -r requirements.txt
    ```

3.  Avviare il server Python:
    ```bash
    # Su Mac/Linux:
    python3 -m uvicorn main:app --reload

    # Su Windows:
    python -m uvicorn main:app --reload
    ```
    *Quando vedrà la scritta "Application startup complete", il backend è attivo.*

### PASSO 2: Configurazione Frontend (Terminale 2)

1.  Aprire un **nuovo terminale** (lasciare ovviamente aperto quello del backend) ed entrare nella cartella frontend:
    ```bash
    cd Frontend
    ```

2.  Installare i pacchetti React (presenti nel file package.json):
    ```bash
    npm install
    ```

3.  Avviare l'applicazione web:
    ```bash
    npm run dev
    ```
    *Il terminale mostrerà il link ( http://localhost:5173). 

---

## Testare le Funzionalità

### 1. Interfaccia Utente (Web App)
Aprire il browser all'indirizzo scritto nel terminale Frontend (es. **http://localhost:5173**).
Da qui potrà:
* Registrare un nuovo paziente.
* Accedere all'area riservata (Paziente, Dottore, Direttore).
* Prenotare visite e scaricare i referti PDF.

### 2. Documentazione API (Swagger UI)
 **http://127.0.0.1:8000/docs**
FastAPI genererà una pagina dove potrà vedere e testare tutti gli endpoint del backend (es. Login, Upload CV, Gestione Pazienti) senza passare dalla grafica.

---

## Struttura del Progetto

* **Backend/**
    * `main.py`: Codice sorgente dell'API.
    * `*.json`: File che fungono da database (pazienti, dottori, appuntamenti).
    * `requirements.txt`: Elenco delle librerie Python.

* **Frontend/**
    * `src/`: Codice sorgente React (Pagine e Componenti).
    * `vite.config.js`: Configurazione del server di sviluppo.
    * `package.json`: Dipendenze Node.js.

---

**Gioele Cantagallo**
Progetto "Clinica Cantagallo" - A.A.2026

--- Nella cartella del frontend troverà un read.me più corto con le sole cose da fare per avviare il server e far funzionare il gestionale   
