from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fpdf import FPDF
import json
import os
import shutil
import traceback
from datetime import datetime
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creazione cartella upload 
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# File database
DOCTORS_FILE = "doctors.json"
PATIENTS_FILE = "patients.json"
APPOINTMENTS_FILE = "appointments.json"
CLINICAL_FILE = "clinical.json"
APPLICATIONS_FILE = "applications.json"
MESSAGES_FILE = "messages.json"
ANNOUNCEMENTS_FILE = "announcements.json"

def load_data(filename):
    if not os.path.exists(filename): return [] if filename != CLINICAL_FILE else {}
    with open(filename, "r") as f: return json.load(f)

def save_data(filename, data):
    with open(filename, "w") as f: json.dump(data, f, indent=4)


for file in [DOCTORS_FILE, PATIENTS_FILE, APPOINTMENTS_FILE, APPLICATIONS_FILE, MESSAGES_FILE, ANNOUNCEMENTS_FILE]:
    if not os.path.exists(file):
        with open(file, "w") as f: json.dump([], f)
if not os.path.exists(CLINICAL_FILE):
    with open(CLINICAL_FILE, "w") as f: json.dump({}, f)

# modelli dati
class UserData(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    password: str
    spec: Optional[str] = None
    hourly_rate: Optional[float] = 50.0

class LoginData(BaseModel):
    email: str
    password: str

class AppointmentData(BaseModel):
    doctor_email: str
    patient_email: str
    patient_name: str
    date: str
    time: str
    type: str
    status: str

class Medication(BaseModel):
    name: str
    dose: str
    freq: str

class Vital(BaseModel):
    date: str
    inr: Optional[float] = None
    press_max: Optional[int] = None
    press_min: Optional[int] = None
    heart_rate: Optional[int] = None
    sat: Optional[int] = None
    weight: Optional[float] = None
    temp: Optional[float] = None

class NoteData(BaseModel):
    text: str

class PasswordUpdate(BaseModel):
    email: str
    old_password: str
    new_password: str
    role: str

class MessageData(BaseModel):
    first_name: str
    last_name: str
    email: str
    text: str
    date: str

class AnnouncementData(BaseModel):
    text: str
    date: str

# dottori api
@app.get("/api/doctors")
async def get_doctors(): return load_data(DOCTORS_FILE)

@app.post("/api/doctors")
async def add_doctor(doc: UserData):
    d = load_data(DOCTORS_FILE)
    nid = 1 if not d else d[-1]["id"] + 1
    nd = doc.dict()
    nd["id"] = nid
    d.append(nd)
    save_data(DOCTORS_FILE, d)
    return nd

@app.put("/api/doctors/{doc_id}")
async def update_doctor(doc_id: int, updated_doc: UserData):
    doctors = load_data(DOCTORS_FILE)
    for i, doc in enumerate(doctors):
        if doc["id"] == doc_id:
            doctors[i]["name"] = updated_doc.name
            doctors[i]["spec"] = updated_doc.spec
            doctors[i]["email"] = updated_doc.email
            doctors[i]["password"] = updated_doc.password
            doctors[i]["hourly_rate"] = updated_doc.hourly_rate
            save_data(DOCTORS_FILE, doctors)
            return {"message": "Medico aggiornato"}
    raise HTTPException(status_code=404, detail="Medico non trovato")

@app.delete("/api/doctors/{doc_id}")
async def delete_doctor(doc_id: int):
    d = [x for x in load_data(DOCTORS_FILE) if x["id"] != doc_id]
    save_data(DOCTORS_FILE, d)
    return {"msg": "Eliminato"}

# appuntamenti api
@app.post("/api/appointments")
async def add_app(a: AppointmentData):
    l = load_data(APPOINTMENTS_FILE)
    for appt in l:
        if appt["date"] == a.date and appt["time"] == a.time and appt["doctor_email"] == a.doctor_email:
            raise HTTPException(status_code=400, detail="Orario già occupato")
    nid = 1 if not l else l[-1]["id"] + 1
    na = a.dict()
    na["id"] = nid
    l.append(na)
    save_data(APPOINTMENTS_FILE, l)
    return {"msg": "OK"}

@app.get("/api/appointments/{email}")
async def get_apps(email: str):
    l = load_data(APPOINTMENTS_FILE); return l if email=="dottore@clinica.it" else [x for x in l if x["doctor_email"]==email]

@app.delete("/api/appointments/{app_id}")
async def delete_appointment(app_id: int):
    apps = load_data(APPOINTMENTS_FILE)
    apps = [a for a in apps if a["id"] != app_id]
    save_data(APPOINTMENTS_FILE, apps)
    return {"message": "Appuntamento cancellato"}

# avvisi api
@app.post("/api/announcements")
async def post_announcement(data: AnnouncementData):
    anns = load_data(ANNOUNCEMENTS_FILE)
    # Genera l'ID
    new_id = 1 if not anns else anns[-1].get("id", 0) + 1
    
    new_ann = data.dict()
    new_ann["id"] = new_id
    
    if len(anns) > 9: anns.pop(0) 
    anns.append(new_ann)
    save_data(ANNOUNCEMENTS_FILE, anns)
    return {"message": "Avviso pubblicato"}

@app.get("/api/announcements")
async def get_announcements():
    return load_data(ANNOUNCEMENTS_FILE)

# api messaggi pubblici
@app.post("/api/messages")
async def send_message(data: MessageData):
    msgs = load_data(MESSAGES_FILE); new_id = 1 if not msgs else msgs[-1]["id"] + 1
    new_msg = data.dict(); new_msg["id"] = new_id; msgs.append(new_msg)
    save_data(MESSAGES_FILE, msgs); return {"message": "Messaggio inviato"}

@app.get("/api/messages")
async def get_messages():
    return load_data(MESSAGES_FILE)

# api candidature lavora con noi
@app.post("/api/applications")
async def submit_application(
    name: str = Form(...), email: str = Form(...), phone: str = Form(...),
    position: str = Form(...), message: str = Form(...), date: str = Form(...),
    cv: UploadFile = File(...)
):
    try:
        file_location = f"uploads/{cv.filename}"
        with open(file_location, "wb+") as buffer: shutil.copyfileobj(cv.file, buffer)
        apps = load_data(APPLICATIONS_FILE); new_id = 1 if not apps else apps[-1]["id"] + 1
        new_app = { "id": new_id, "name": name, "email": email, "phone": phone, "position": position, "message": message, "date": date, "cv_filename": cv.filename, "cv_path": f"/uploads/{cv.filename}" }
        apps.append(new_app); save_data(APPLICATIONS_FILE, apps)
        return {"message": "OK"}
    except: raise HTTPException(500)

@app.get("/api/applications")
async def get_applications(): return load_data(APPLICATIONS_FILE)

# api clinica 
@app.get("/api/clinical/{email}")
async def get_clinical(email: str): return load_data(CLINICAL_FILE).get(email, {"medications":[],"vitals":[],"notes":""})

@app.post("/api/clinical/{email}/medications")
async def add_med(email: str, m: Medication):
    d = load_data(CLINICAL_FILE); 
    if email not in d: d[email]={"medications":[],"vitals":[],"notes":""}
    d[email]["medications"].append(m.dict()); save_data(CLINICAL_FILE, d); return {"msg":"OK"}

@app.post("/api/clinical/{email}/medications/remove")
async def rm_med(email: str, m: Medication):
    d = load_data(CLINICAL_FILE)
    if email in d: d[email]["medications"] = [x for x in d[email]["medications"] if x["name"]!=m.name]
    save_data(CLINICAL_FILE, d); return {"msg":"OK"}

@app.post("/api/clinical/{email}/vitals")
async def add_vit(email: str, v: Vital):
    d = load_data(CLINICAL_FILE); 
    if email not in d: d[email]={"medications":[],"vitals":[],"notes":""}
    d[email]["vitals"].append(v.dict()); d[email]["vitals"].sort(key=lambda x:x["date"]); save_data(CLINICAL_FILE, d); return {"msg":"OK"}

@app.post("/api/clinical/{email}/notes")
async def add_note(email: str, n: NoteData):
    d = load_data(CLINICAL_FILE); 
    if email not in d: d[email]={"medications":[],"vitals":[],"notes":""}
    d[email]["notes"]=n.text; save_data(CLINICAL_FILE, d); return {"msg":"OK"}

@app.post("/api/register")
async def reg(u: UserData):
    l=load_data(PATIENTS_FILE); 
    for p in l: 
        if p["email"]==u.email: raise HTTPException(400, "Email esistente")
    nid=1 if not l else l[-1]["id"]+1; l.append({"id":nid, "name":u.name, "email":u.email, "password":u.password, "role":"paziente"}); save_data(PATIENTS_FILE, l); return {"msg":"OK"}

@app.get("/api/patients")
async def get_pats(): return load_data(PATIENTS_FILE)

@app.post("/api/login")
async def log(d: LoginData):
    if d.email=="admin@clinica.it" and d.password=="admin": return {"role":"direttore","name":"Direttore"}
    for x in load_data(DOCTORS_FILE): 
        if x["email"]==d.email and x["password"]==d.password: return {"role":"dottore","name":x["name"],"email":x["email"],"spec":x["spec"]}
    for x in load_data(PATIENTS_FILE):
        if x["email"]==d.email and x["password"]==d.password: return {"role":"paziente","name":x["name"],"email":x["email"]}
    if d.email=="dottore@clinica.it" and d.password=="dottore": return {"role":"dottore","name":"Demo Doc","email":"dottore@clinica.it"}
    if d.email=="paziente@clinica.it" and d.password=="paziente": return {"role":"paziente","name":"Demo Pat","email":"paziente@clinica.it"}
    raise HTTPException(401, "Errore login")

@app.post("/api/update-password")
async def update_password(data: PasswordUpdate):
    if data.role == "dottore":
        doctors = load_data(DOCTORS_FILE)
        for doc in doctors:
            if doc["email"] == data.email:
                if doc["password"] != data.old_password: raise HTTPException(400)
                doc["password"] = data.new_password; save_data(DOCTORS_FILE, doctors); return {"message": "OK"}
        raise HTTPException(404)
    elif data.role == "paziente":
        patients = load_data(PATIENTS_FILE)
        for p in patients:
            if p["email"] == data.email:
                if p["password"] != data.old_password: raise HTTPException(400)
                p["password"] = data.new_password; save_data(PATIENTS_FILE, patients); return {"message": "OK"}
        raise HTTPException(404)
    elif data.role == "direttore":
        if data.old_password != "admin": raise HTTPException(400); return {"message": "OK"}
    raise HTTPException(400)

# funzione x generatore referto pdf 
class PDF(FPDF):
    def header(self):
        self.set_fill_color(13, 71, 161); self.rect(0, 0, 210, 40, 'F')
        self.set_font('Arial', 'B', 20); self.set_text_color(255, 255, 255); self.cell(0, 25, 'CLINICA PRIVATA CANTAGALLO', 0, 1, 'C'); self.ln(20)
    def footer(self):
        self.set_y(-15); self.set_font('Arial', 'I', 8); self.set_text_color(128); self.cell(0, 10, f'Pagina {self.page_no()}', 0, 0, 'C')

def safe_text(text): return str(text).encode('latin-1', 'replace').decode('latin-1') if text else ""

@app.get("/download-referto/{identificativo}")
async def generate_pdf(identificativo: str):
    try:
        clinical_data = load_data(CLINICAL_FILE)
        patients_list = load_data(PATIENTS_FILE)
        target_email = identificativo
        target_name = "Paziente" 
        target_clinical = {"medications": [], "vitals": [], "notes": ""}

        for p in patients_list:
            if p["email"] == target_email: target_name = p["name"]; break
        
        if target_name == "Paziente" and "@" not in target_email: target_name = target_email.replace("_", " ")
        if target_email in clinical_data: target_clinical = clinical_data[target_email]
        
        pdf = PDF(); pdf.add_page(); pdf.set_auto_page_break(True, 15)
        pdf.set_font("Arial","B",14); pdf.set_text_color(0); pdf.cell(0,10,f"Cartella: {safe_text(target_name)}",0,1)
        pdf.set_font("Arial","",12); pdf.cell(0,10,f"Email: {safe_text(target_email)}",0,1); pdf.cell(0,10,f"Data: {datetime.now().strftime('%d/%m/%Y')}",0,1); pdf.line(10,75,200,75); pdf.ln(15)
        
        pdf.set_font("Arial","B",14); pdf.set_text_color(13,71,161); pdf.cell(0,10,"Note",0,1); pdf.set_font("Arial","",11); pdf.set_text_color(0); pdf.multi_cell(0,8,safe_text(target_clinical.get("notes","Nessuna")))
        pdf.ln(5); pdf.set_font("Arial","B",14); pdf.set_text_color(13,71,161); pdf.cell(0,10,"Terapie",0,1); pdf.set_font("Arial","",11); pdf.set_text_color(0)
        if target_clinical.get("medications"): 
            for m in target_clinical["medications"]: pdf.cell(10); pdf.cell(0,8,f"- {safe_text(m['name'])}: {safe_text(m['dose'])}",0,1)
        else: pdf.cell(10); pdf.cell(0,8,"Nessuna",0,1)
        
        pdf.ln(10); pdf.set_font("Arial","B",14); pdf.set_text_color(13,71,161); pdf.cell(0,10,"Vitali (Ultimi 10)",0,1); pdf.set_font("Arial","B",10); pdf.set_fill_color(240); pdf.set_text_color(0)
        col_w=[30,20,30,20,20,20,20]; headers=["Data","INR","Press","BPM","SpO2","Kg","C"]
        for i,h in enumerate(headers): pdf.cell(col_w[i],10,h,1,0,'C',1)
        pdf.ln(); pdf.set_font("Arial","",10)
        if target_clinical.get("vitals"):
            for v in sorted(target_clinical["vitals"], key=lambda x:x["date"], reverse=True)[:10]:
                p=f"{v.get('press_max','')}/{v.get('press_min','')}" if v.get('press_max') else "-"
                pdf.cell(col_w[0],8,safe_text(v.get('date','-')),1,0,'C'); pdf.cell(col_w[1],8,safe_text(v.get('inr')or'-'),1,0,'C'); pdf.cell(col_w[2],8,safe_text(p),1,0,'C'); pdf.cell(col_w[3],8,safe_text(v.get('heart_rate')or'-'),1,0,'C'); pdf.cell(col_w[4],8,safe_text(v.get('sat')or'-'),1,0,'C'); pdf.cell(col_w[5],8,safe_text(v.get('weight')or'-'),1,0,'C'); pdf.cell(col_w[6],8,safe_text(v.get('temp')or'-'),1,1,'C')
        else: pdf.cell(0,10,"Nessun dato",1,1,'C')
        
        f="referto.pdf"; pdf.output(f); return FileResponse(f,filename=f, media_type='application/pdf')
    except: print(traceback.format_exc()); raise HTTPException(500)
