document.addEventListener('DOMContentLoaded', () => {
    const expertBtns = document.querySelectorAll('.expert-btn');
    const expertNameHeader = document.getElementById('current-expert-name');
    const expertIconContainer = document.getElementById('current-expert-icon');
    const chatContainer = document.getElementById('chat-container');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const typingIndicator = document.getElementById('typing-indicator');
    
    // Voice controls
    const micBtn = document.getElementById('mic-btn');
    const autoplayTts = document.getElementById('autoplay-tts');
    const ttsAudio = document.getElementById('tts-audio');

    let currentPersona = 'pediatrician';
    let chatHistory = {
        'pediatrician': [{ role: 'system', text: 'Welcome! I am your AI Pediatrician. How can I help you today?' }],
        'neurologist': [{ role: 'system', text: 'Hello, I am a Neurologist. What brings you in today?' }],
        'cardiologist': [{ role: 'system', text: 'Hi there, I am a Cardiologist. How is your heart health?' }],
        'psychologist': [{ role: 'system', text: 'Welcome. I am a Psychologist. I am here to listen.' }],
        'nutritionist': [{ role: 'system', text: 'Hello! As a Nutritionist, I can help you with your dietary goals.' }],
        'pharmacist': [{ role: 'system', text: 'Greetings. I am a Pharmacist. Do you have questions about any medications?' }],
        'physiotherapist': [{ role: 'system', text: 'Hi! I am a Physiotherapist. Let\'s talk about your physical health.' }],
        'general physician': [{ role: 'system', text: 'Hello, I am a General Physician. What symptoms are you experiencing?' }],
        'medicine specialist': [{ role: 'system', text: 'Greetings. I am a Medicine Specialist. How can I assist with your complex medical needs?' }],
        'hematologist': [{ role: 'system', text: 'Hello. I am a Hematologist. Do you have questions about your blood health?' }],
        'neurophysiologist': [{ role: 'system', text: 'Hi. I am a Neurophysiologist. Let us discuss your nervous system function.' }],
        'endocrinologist': [{ role: 'system', text: 'Welcome! I am an Endocrinologist. How are your hormone and metabolic health?' }],
        'pulmonologist': [{ role: 'system', text: 'Hello, I am a Pulmonologist. Are you experiencing any breathing or lung issues?' }],
        'gastroenterologist': [{ role: 'system', text: 'Hi there, I am a Gastroenterologist. How is your digestive health?' }],
        'hepatologist': [{ role: 'system', text: 'Greetings. I am a Hepatologist. Do you have questions concerning your liver or pancreas?' }],
        'nephrologist': [{ role: 'system', text: 'Hello! I am a Nephrologist. How can I clear up questions about your kidney health?' }],
        'dermatologist': [{ role: 'system', text: 'Welcome. I am a Dermatologist. How can I help you with your skin, hair, or nails?' }],
        'allergist': [{ role: 'system', text: 'Hi! I am an Allergist. Are you having any allergic reactions or asthma flare-ups?' }],
        'immunologist': [{ role: 'system', text: 'Hello. I am an Immunologist. Let me help you understand your immune system.' }],
        'infectious disease specialist': [{ role: 'system', text: 'Greetings. I am an Infectious Disease Specialist. Are you dealing with an infection?' }],
        'physiatrist': [{ role: 'system', text: 'Welcome. I am a Physiatrist. Let us focus on your physical rehabilitation and recovery.' }],
        'gynecologist': [{ role: 'system', text: 'Hello, I am a Gynecologist. How can I help with your reproductive well-being?' }],
        'andrologist': [{ role: 'system', text: 'Hi there. I am an Andrologist. Do you have concerns regarding male reproductive health?' }],
        'obstetrician': [{ role: 'system', text: 'Welcome! I am an Obstetrician. Let us discuss your pregnancy and care.' }],
        'fertility specialist': [{ role: 'system', text: 'Hello. I am a Fertility Specialist. How can I assist you on your journey to conceive?' }],
        'dentist': [{ role: 'system', text: 'Greetings! I am your Dentist. How are your teeth and gums feeling?' }],
        'periodontist': [{ role: 'system', text: 'Hello, I am a Periodontist. Do you have specific concerns about your gums?' }],
        'orthodontist': [{ role: 'system', text: 'Hi! I am an Orthodontist. Do you have questions about braces or jaw alignment?' }],
        'ophthalmologist': [{ role: 'system', text: 'Welcome. I am an Ophthalmologist. How can I assist you with your eye health today?' }],
        'ent specialist': [{ role: 'system', text: 'Hello! I am an ENT Specialist. Having ear, nose, or throat troubles?' }],
        'audiologist': [{ role: 'system', text: 'Greetings. I am an Audiologist. Have you experienced any hearing or balance issues?' }],
        'optometrist': [{ role: 'system', text: 'Hi there, I am an Optometrist. Has your vision been changing?' }],
        'psychiatrist': [{ role: 'system', text: 'Welcome. I am a Psychiatrist. I am here to provide medical support for your mental health.' }],
        'neuropsychiatrist': [{ role: 'system', text: 'Hello. I am a Neuropsychiatrist. How can I help you with complex cognitive or psychological symptoms?' }],
        'neonatologist': [{ role: 'system', text: 'Greetings. I am a Neonatologist. Have questions about the intensive care of a newborn?' }],
        'geriatrician': [{ role: 'system', text: 'Hi! I am a Geriatrician. Let us discuss elderly health and healthy aging.' }],
        'orthopedist': [{ role: 'system', text: 'Welcome. I am an Orthopedist. Do you have an injury to your bones, joints, or muscles?' }],
        'rheumatologist': [{ role: 'system', text: 'Hello. I am a Rheumatologist. Are you experiencing joint pain or autoimmune symptoms?' }],
        'oncologist': [{ role: 'system', text: 'Greetings. I am an Oncologist. I am here to provide expert insights into cancer treatments and care.' }],
        'ayurveda doctor': [{ role: 'system', text: 'Namaste. I am an Ayurveda Doctor. Let us discuss naturally balancing your doshas.' }],
        'homeopathy doctor': [{ role: 'system', text: 'Hello. I am a Homeopathy Doctor. What symptoms can we address gently today?' }],
        'unani doctor': [{ role: 'system', text: 'Greetings. I am a Unani Doctor. Let us explore natural healing and your humors.' }],
        'naturopathy doctor': [{ role: 'system', text: 'Welcome! I am a Naturopathy Doctor. How can I help promote your self-healing?' }],
        'siddha doctor': [{ role: 'system', text: 'Vanakkam. I am a Siddha Doctor. Ready to integrate your physical and spiritual well-being?' }],
        'all-in-one surgeon': [{ role: 'system', text: 'Welcome! I am an All-In-One Surgeon. How can I assist with your surgical needs today?' }]
    };

    // Change Persona
    expertBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            expertBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentPersona = btn.dataset.persona;
            expertNameHeader.textContent = btn.textContent.trim();
            expertIconContainer.innerHTML = btn.querySelector('i').outerHTML;
            
            renderChat();
        });
    });

    function renderChat() {
        chatContainer.innerHTML = '';
        const history = chatHistory[currentPersona];
        
        history.forEach(msg => {
            const div = document.createElement('div');
            div.classList.add('message');
            if (msg.role === 'user') {
                div.classList.add('user-msg');
            } else if (msg.role === 'ai') {
                div.classList.add('ai-msg');
            } else {
                div.classList.add('system-msg');
            }
            div.textContent = msg.text;
            chatContainer.appendChild(div);
        });
        scrollToBottom();
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        // Add user message to UI and history
        addMessage(text, 'user');
        userInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    persona: currentPersona
                })
            });

            const data = await response.json();
            hideTypingIndicator();
            if (response.ok) {
                addMessage(data.reply, 'ai');
                if (autoplayTts.checked) {
                    playTTS(data.reply);
                }
            } else {
                addMessage(`Error: ${data.error}`, 'system');
            }
        } catch (error) {
            hideTypingIndicator();
            addMessage('Error connecting to the server.', 'system');
        }
    });

    function addMessage(text, role) {
        chatHistory[currentPersona].push({ role, text });
        
        const div = document.createElement('div');
        div.classList.add('message');
        if (role === 'user') div.classList.add('user-msg');
        else if (role === 'ai') div.classList.add('ai-msg');
        else div.classList.add('system-msg');
        
        div.textContent = text;
        chatContainer.appendChild(div);
        scrollToBottom();
    }

    function showTypingIndicator() {
        typingIndicator.classList.remove('hidden');
        chatContainer.appendChild(typingIndicator); // move to bottom
        scrollToBottom();
    }

    function hideTypingIndicator() {
        typingIndicator.classList.add('hidden');
    }

    // Text to Speech playback
    async function playTTS(text) {
        try {
            const resp = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });
            const data = await resp.json();
            if (resp.ok && data.audio_url) {
                ttsAudio.src = data.audio_url;
                ttsAudio.play();
            }
        } catch (e) {
            console.error('Error playing TTS:', e);
        }
    }

    // Speech to Text (Voice Input)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        let isRecording = false;

        micBtn.addEventListener('click', () => {
            if (isRecording) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });

        recognition.onstart = () => {
            isRecording = true;
            micBtn.classList.add('recording');
            userInput.placeholder = "Listening...";
        };

        recognition.onspeechend = () => {
            recognition.stop();
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            // Optionally auto-submit
            // chatForm.dispatchEvent(new Event('submit'));
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            isRecording = false;
            micBtn.classList.remove('recording');
            userInput.placeholder = "Type or speak your symptoms...";
        };

        recognition.onend = () => {
            isRecording = false;
            micBtn.classList.remove('recording');
            userInput.placeholder = "Type or speak your symptoms...";
        };
    } else {
        micBtn.style.display = 'none'; // Hide if not supported
    }

    // Initial render
    renderChat();
});
