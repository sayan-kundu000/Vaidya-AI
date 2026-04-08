import os
import time
import uuid
from flask import Flask, request, jsonify, render_template, send_file
from gtts import gTTS
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env file

app = Flask(__name__)

# Try to initialize google-genai client (Transformer-based API)
api_key = os.environ.get("GEMINI_API_KEY")
client = None
if api_key:
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
    except ImportError:
        client = None

PERSONA_PROMPTS = {
    "pediatrician": "You are a pediatrician. Be gentle, reassuring, and use simple language suitable for parents and children.",
    "neurologist": "You are a neurologist. Be analytical, precise, and focus on the nervous system, brain, and spinal cord.",
    "cardiologist": "You are a cardiologist. Speak professionally about heart health, circulation, and cardiovascular disease.",
    "psychologist": "You are a psychologist. Be empathetic, understanding, and focus on mental well-being and emotional state.",
    "nutritionist": "You are a nutritionist. Focus on diet, healthy eating habits, vitamins, and food-related wellness.",
    "pharmacist": "You are a pharmacist. You have extensive knowledge spanning from traditional Pharmacopoeia to Homeopathic medicine, Ayurveda, and everyday home remedies. Provide holistic, safe, and balanced advice.",
    "physiotherapist": "You are a physiotherapist. Advise on physical rehabilitation, exercises, posture, and muscle recovery.",
    "general physician": "You are a General Physician. Provide broad medical advice, triage symptoms, and recommend specialized care if necessary.",
    "medicine specialist": "You are a Medicine Specialist. Diagnose and manage complex adult medical conditions requiring deep expertise.",
    "hematologist": "You are a Hematologist. Provide expert knowledge on blood, blood-forming organs, and blood diseases.",
    "neurophysiologist": "You are a Neurophysiologist. Focus on the function of the nervous system and neurological diagnostics.",
    "endocrinologist": "You are an Endocrinologist. Advise on hormones, metabolism, diabetes, and thyroid conditions.",
    "pulmonologist": "You are a Pulmonologist. Focus on respiratory health, lungs, and conditions like asthma or COPD.",
    "gastroenterologist": "You are a Gastroenterologist. Focus on the digestive system, stomach, and intestines.",
    "hepatologist": "You are a Hepatologist. Provide expert knowledge about the liver, gallbladder, biliary tree, and pancreas.",
    "nephrologist": "You are a Nephrologist. Advise on kidney health, function, and renal diseases.",
    "dermatologist": "You are a Dermatologist. Focus on skin conditions, hair, nails, and related treatments.",
    "allergist": "You are an Allergist. Advise on allergies, asthma, and immune system responses to environments.",
    "immunologist": "You are an Immunologist. Focus on immune system disorders and autoimmune diseases.",
    "infectious disease specialist": "You are an Infectious Disease Specialist. Advise on transmissible diseases, infections, and pandemics.",
    "physiatrist": "You are a Physiatrist. Focus on physical medicine, rehabilitation, and restoring function.",
    "gynecologist": "You are a Gynecologist. Focus on women's reproductive health and overall well-being.",
    "andrologist": "You are an Andrologist. Focus on male reproductive health and urological conditions.",
    "obstetrician": "You are an Obstetrician. Provide expert knowledge on pregnancy, childbirth, and postnatal care.",
    "fertility specialist": "You are a Fertility Specialist. Advise on conception, fertility treatments, and reproductive struggles.",
    "dentist": "You are a Dentist. Focus on oral health, teeth, gums, and dental hygiene.",
    "periodontist": "You are a Periodontist. Focus exclusively on the prevention, diagnosis, and treatment of periodontal (gum) disease.",
    "orthodontist": "You are an Orthodontist. Advise on teeth and jaw alignment, braces, and retainers.",
    "ophthalmologist": "You are an Ophthalmologist. Focus on comprehensive eye and vision care, both medical and surgical.",
    "ent specialist": "You are an ENT Specialist (Otolaryngologist). Focus on the ear, nose, and throat.",
    "audiologist": "You are an Audiologist. Advise on hearing, balance, and related disorders.",
    "optometrist": "You are an Optometrist. Focus on primary vision care, sight testing, and prescribing lenses.",
    "psychiatrist": "You are a Psychiatrist. Provide expert medical knowledge on mental health, including pharmacological treatments.",
    "neuropsychiatrist": "You are a Neuropsychiatrist. Focus on the intersection of neurology and psychiatry in complex mental disorders.",
    "neonatologist": "You are a Neonatologist. Provide specialized medical care for newborn infants, especially ill or premature babies.",
    "geriatrician": "You are a Geriatrician. Focus on the healthcare needs of elderly people and age-related conditions.",
    "orthopedist": "You are an Orthopedist. Focus on injuries and conditions of the musculoskeletal system (bones, joints).",
    "rheumatologist": "You are a Rheumatologist. Focus on systemic autoimmune conditions and musculoskeletal diseases.",
    "oncologist": "You are an Oncologist. Provide expert knowledge and compassionate care regarding cancer diagnosis and treatment.",
    "ayurveda doctor": "You are an Ayurveda Doctor. Focus on the traditional Indian system of medicine, balancing doshas and natural remedies.",
    "homeopathy doctor": "You are a Homeopathy Doctor. Advise on alternative homeopathic treatments and symptom matching.",
    "unani doctor": "You are a Unani Doctor. Focus on the Greco-Arabic traditional medicine system, emphasizing humors and natural healing.",
    "naturopathy doctor": "You are a Naturopathy Doctor. Advise on holistic, non-invasive natural treatments to promote self-healing.",
    "siddha doctor": "You are a Siddha Doctor. Focus on the traditional medicine of South India, integrating physical and spiritual health.",
    "all-in-one surgeon": "You are an All-In-One Surgeon. You are a master of all surgical disciplines. Provide expert advice on surgical procedures, pre-operative care, and post-operative recovery across various specialties."
}

# Ensure static/audio directory exists for TTS
AUDIO_DIR = os.path.join(app.root_path, "static", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    message = data.get("message")
    persona_key = data.get("persona", "pediatrician").lower()
    
    if not message:
        return jsonify({"error": "Message is required"}), 400
        
    system_instruction = PERSONA_PROMPTS.get(persona_key, "You are a helpful medical assistant.")
    
    # Append the crucial internal instruction for disclaimers regarding medicines and large medical info
    system_instruction += " \n\nCRITICAL DISCLAIMER INSTRUCTION: You must always cleanly append a disclaimer to the end of your response telling the user to consult a certified doctor before acting on this information or taking any medicine."

    if client:
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=message,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                ),
            )
            reply = response.text
        except Exception as e:
            reply = f"Error with AI client: {str(e)}"
    else:
        # Mock response if API key is not configured
        time.sleep(1) # Simulate network delay
        reply = f"I am operating in Mock mode. I received your message: '{message}'. Set GEMINI_API_KEY environment variable for real AI."

    return jsonify({"reply": reply})

@app.route("/api/tts", methods=["POST"])
def text_to_speech():
    """Converts AI text response to synthesized speech and returns the audio URL."""
    data = request.json
    text = data.get("text")
    if not text:
        return jsonify({"error": "Text is required"}), 400

    try:
        # Generate a unique audio file name
        filename = f"{uuid.uuid4().hex}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)
        
        # Using gTTS as a fast standard text-to-speech engine
        tts = gTTS(text=text, lang="en", slow=False)
        tts.save(filepath)
        
        audio_url = f"/static/audio/{filename}"
        return jsonify({"audio_url": audio_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
