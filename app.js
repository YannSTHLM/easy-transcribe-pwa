document.addEventListener('DOMContentLoaded', () => {
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const transcriptArea = document.getElementById('transcript');
    
    let mediaRecorder;
    let audioChunks = [];
    let recognition;
    let finalTranscription = ''; // Accumulated final transcription
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscription += event.results[i][0].transcript + '\n';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            // Update the textarea with both interim and final
            transcriptArea.value = finalTranscription + interimTranscript;
        };
    }

    recordBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioChunks = [];
                
                if (recognition) {
                    recognition.stop();
                }
                
                // Check if there's a Groq API key and send the transcription
                const groqApiKey = localStorage.getItem('groqApiKey');
                if (groqApiKey) {
                    // Show loading indicator
                    transcriptArea.value += "\n\nProcessing with Groq...\n";
                    
                    // Send to Groq
                    sendToGroq(finalTranscription, groqApiKey);
                }
            };
            
            mediaRecorder.start();
            recordBtn.disabled = true;
            stopBtn.disabled = false;
        } catch (error) {
            console.error('Recording error:', error);
            alert('Could not start recording: ' + error.message);
        }
    });

    stopBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            recordBtn.disabled = false;
            stopBtn.disabled = true;
        }
    });
    
    // Function to send transcription to Groq
    async function sendToGroq(transcription, apiKey) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "mixtral-8x7b-32768",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful assistant that refines and corrects transcriptions. Output only the refined transcription without any extra commentary."
                        },
                        {
                            role: "user",
                            content: `Refine this transcription: ${transcription}`
                        }
                    ]
                })
            });
            
            const data = await response.json();
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const groqResponse = data.choices[0].message.content;
                transcriptArea.value += `\n\n--- Groq Enhanced ---\n${groqResponse}`;
            } else {
                throw new Error('Invalid response from Groq');
            }
        } catch (error) {
            console.error('Groq API error:', error);
            transcriptArea.value += `\n\n--- Groq Error ---\nFailed to process with Groq: ${error.message}`;
        }
    }
});
