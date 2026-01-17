// ===== STATE MANAGEMENT =====
let currentAvatarStyle = 'robot';
let currentBackgroundColor = '#ff6b9d';
let generatedIntroduction = '';
let isSpeaking = false;

// ===== DOM ELEMENTS =====
const avatar = document.getElementById('avatar');
const avatarContainer = document.getElementById('avatarContainer');
const avatarName = document.getElementById('avatarName');
const mouth = document.getElementById('mouth');
const nameInput = document.getElementById('nameInput');
const ageSelect = document.getElementById('ageSelect');
const hobbyInput = document.getElementById('hobbyInput');
const colorInput = document.getElementById('colorInput');
const dreamJobInput = document.getElementById('dreamJobInput');
const extraPointsInput = document.getElementById('extraPointsInput');
const colorPicker = document.getElementById('colorPicker');
const apiKeyInput = document.getElementById('apiKeyInput');
const generateBtn = document.getElementById('generateBtn');
const speakBtn = document.getElementById('speakBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const introductionBox = document.getElementById('introductionBox');
const introductionText = document.getElementById('introductionText');
const styleButtons = document.querySelectorAll('.style-btn');
const colorPresets = document.querySelectorAll('.color-preset');
const confettiContainer = document.getElementById('confettiContainer');

// ===== AVATAR STYLE SELECTION =====
styleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        styleButtons.forEach(b => b.classList.remove('active'));

        // Add active class to clicked button
        btn.classList.add('active');

        // Update avatar style
        currentAvatarStyle = btn.dataset.style;
        updateAvatarStyle();

        // Add sparkle effect
        createSparkles(btn);
    });
});

function updateAvatarStyle() {
    // Remove all style classes
    avatar.classList.remove('robot', 'animal', 'superhero', 'alien');

    // Add current style class
    avatar.classList.add(currentAvatarStyle);

    // Add bounce animation
    avatar.classList.remove('bounce');
    setTimeout(() => avatar.classList.add('bounce'), 10);
}

// ===== COLOR PICKER =====
colorPicker.addEventListener('input', (e) => {
    currentBackgroundColor = e.target.value;
    updateBackgroundColor();
});

colorPresets.forEach(preset => {
    preset.addEventListener('click', () => {
        currentBackgroundColor = preset.dataset.color;
        colorPicker.value = currentBackgroundColor;
        updateBackgroundColor();
        createSparkles(preset);
    });
});

function updateBackgroundColor() {
    avatarContainer.style.background = currentBackgroundColor;
}

// ===== NAME INPUT =====
nameInput.addEventListener('input', (e) => {
    const name = e.target.value.trim() || 'My Avatar';
    avatarName.textContent = name;
});

// ===== AI INTRODUCTION GENERATOR =====
generateBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const age = ageSelect.value;
    const apiKey = apiKeyInput.value.trim();

    // Validation
    if (!name) {
        alert('🎨 Please enter your name first!');
        nameInput.focus();
        return;
    }

    if (!age) {
        alert('🎂 Please select your age!');
        ageSelect.focus();
        return;
    }

    if (!apiKey) {
        alert('🔑 Please enter your Gemini API key!\n\nYou can get one for free from Google AI Studio.');
        apiKeyInput.focus();
        return;
    }

    // Disable button and show loading
    generateBtn.disabled = true;
    generateBtn.textContent = '✨ Creating Magic... ✨';

    // Create sparkles
    createMultipleSparkles(generateBtn, 20);

    try {
        // Get additional details
        const hobby = hobbyInput.value.trim();
        const favoriteColor = colorInput.value.trim();
        const dreamJob = dreamJobInput.value.trim();
        const extraPoints = extraPointsInput.value.trim();

        // Call Gemini API
        const introduction = await generateIntroductionWithAI(name, age, currentAvatarStyle, hobby, favoriteColor, dreamJob, extraPoints, apiKey);

        // Display introduction
        generatedIntroduction = introduction;
        introductionText.textContent = introduction;
        introductionBox.classList.remove('hidden');

        // Enable action buttons
        speakBtn.disabled = false;
        downloadBtn.disabled = false;
        copyBtn.disabled = false;

        // Trigger confetti
        createConfetti();

        // Scroll to introduction
        introductionBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (error) {
        console.error('Error generating introduction:', error);
        alert('❌ Oops! Something went wrong.\n\nPlease check your API key and try again!\n\nError: ' + error.message);
    } finally {
        // Re-enable button
        generateBtn.disabled = false;
        generateBtn.textContent = '✨ Generate My Introduction! ✨';
    }
});

async function generateIntroductionWithAI(name, age, avatarStyle, hobby, favoriteColor, dreamJob, extraPoints, apiKey) {
    // Build the complete required introduction
    let requiredIntro = `Hi! My name is ${name}. I am ${age} years old.`;

    if (hobby) {
        requiredIntro += ` My favorite hobby is ${hobby}.`;
    }
    if (favoriteColor) {
        requiredIntro += ` My favorite color is ${favoriteColor}.`;
    }
    if (dreamJob) {
        requiredIntro += ` My dream job is ${dreamJob}.`;
    }
    if (extraPoints) {
        requiredIntro += ` ${extraPoints}`;
    }

    // Simple, direct prompt
    let prompt = `Write a fun self-introduction for ${name}, a ${age}-year-old with a ${avatarStyle} avatar.\n\n`;
    prompt += `You must write EXACTLY this at the start:\n"${requiredIntro}"\n\n`;
    prompt += `Then continue for 6-8 more sentences about:\n`;
    prompt += `- Why they love their hobby\n`;
    prompt += `- Why they like their favorite color\n`;
    prompt += `- What they want to do in their dream job\n`;
    prompt += `- Their ${avatarStyle} personality (tech-savvy/playful/brave/curious)\n`;
    prompt += `- Fun facts about them\n`;
    prompt += `- End with excitement\n\n`;
    prompt += `Write the complete introduction now:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.9,
                topK: 64,
                topP: 0.99,
                maxOutputTokens: 1024,
                candidateCount: 1,
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_NONE'
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_NONE'
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_NONE'
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_NONE'
                }
            ]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate introduction');
    }

    const data = await response.json();

    // Check if response was cut off
    if (!data.candidates || !data.candidates[0]) {
        throw new Error('No response generated');
    }

    const candidate = data.candidates[0];

    // Check finish reason
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        console.warn('Generation stopped early. Reason:', candidate.finishReason);

        // If it was blocked by safety, try to use what we have
        if (candidate.finishReason === 'SAFETY') {
            console.warn('Content was blocked by safety filters');
        }
    }

    if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
        throw new Error('No content in response');
    }

    let introduction = candidate.content.parts[0].text.trim();

    // Remove any quotes at the beginning/end
    introduction = introduction.replace(/^["']|["']$/g, '');

    // Check if introduction is complete
    const wordCount = introduction.split(' ').length;
    console.log(`Generated introduction: ${wordCount} words`);
    console.log('Finish reason:', candidate.finishReason);

    // If introduction seems incomplete, log a warning
    if (wordCount < 80) {
        console.warn('Introduction may be incomplete. Only', wordCount, 'words generated.');
        console.warn('Full response:', introduction);
    }

    return introduction;
}

// ===== TEXT-TO-SPEECH =====
speakBtn.addEventListener('click', () => {
    if (isSpeaking) {
        stopSpeaking();
    } else {
        startSpeaking();
    }
});

function startSpeaking() {
    if (!generatedIntroduction) return;

    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
        alert('😢 Sorry! Your browser doesn\'t support text-to-speech.');
        return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(generatedIntroduction);
    utterance.rate = 0.9; // Slightly slower for kids
    utterance.pitch = 1.2; // Higher pitch for kid-friendly voice
    utterance.volume = 1.0;

    // Add mouth animation
    mouth.classList.add('speaking');
    isSpeaking = true;
    speakBtn.textContent = '🔇 Stop Speaking';
    speakBtn.style.background = 'linear-gradient(135deg, #ff6b9d, #ff9a56)';

    // Handle speech end
    utterance.onend = () => {
        stopSpeaking();
    };

    utterance.onerror = () => {
        stopSpeaking();
        alert('😢 Oops! Something went wrong with the speech.');
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
    window.speechSynthesis.cancel();
    mouth.classList.remove('speaking');
    isSpeaking = false;
    speakBtn.textContent = '🔊 Make Me Speak!';
    speakBtn.style.background = 'linear-gradient(135deg, #4ecdc4, #34d399)';
}

// ===== DOWNLOAD AVATAR CARD =====
downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true;
    downloadBtn.textContent = '💾 Creating Image...';

    try {
        const avatarCard = document.getElementById('avatarCard');

        // Use html2canvas to capture the avatar card
        const canvas = await html2canvas(avatarCard, {
            backgroundColor: null,
            scale: 2, // Higher quality
            logging: false
        });

        // Convert to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const name = nameInput.value.trim() || 'MyAvatar';
            link.download = `${name}-Avatar-Card.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);

            // Show success
            createSparkles(downloadBtn);
            setTimeout(() => {
                downloadBtn.textContent = '✅ Saved!';
                setTimeout(() => {
                    downloadBtn.textContent = '💾 Save Avatar Card';
                }, 2000);
            }, 100);
        });

    } catch (error) {
        console.error('Error downloading avatar:', error);
        alert('❌ Oops! Couldn\'t save the avatar card.');
    } finally {
        downloadBtn.disabled = false;
    }
});

// ===== COPY TO CLIPBOARD =====
copyBtn.addEventListener('click', async () => {
    if (!generatedIntroduction) return;

    try {
        await navigator.clipboard.writeText(generatedIntroduction);

        // Show success feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        createSparkles(copyBtn);

        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);

    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = generatedIntroduction;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            copyBtn.textContent = '✅ Copied!';
            createSparkles(copyBtn);
            setTimeout(() => {
                copyBtn.textContent = '📋 Copy Introduction';
            }, 2000);
        } catch (err) {
            alert('❌ Couldn\'t copy to clipboard. Please select and copy manually!');
        }

        document.body.removeChild(textArea);
    }
});

// ===== VISUAL EFFECTS =====
function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        const angle = (Math.PI * 2 * i) / 8;
        const distance = 50;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        sparkle.style.background = `hsl(${Math.random() * 360}, 100%, 70%)`;

        document.body.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 1000);
    }
}

function createMultipleSparkles(element, count) {
    const rect = element.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';

            const x = rect.left + Math.random() * rect.width;
            const y = rect.top + Math.random() * rect.height;

            sparkle.style.left = x + 'px';
            sparkle.style.top = y + 'px';
            sparkle.style.background = `hsl(${Math.random() * 360}, 100%, 70%)`;

            document.body.appendChild(sparkle);

            setTimeout(() => sparkle.remove(), 1000);
        }, i * 50);
    }
}

function createConfetti() {
    const colors = ['#ff6b9d', '#ffd93d', '#4ecdc4', '#a78bfa', '#fb923c', '#34d399'];

    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';

            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (Math.random() * 10 + 5) + 'px';
            confetti.style.height = (Math.random() * 10 + 5) + 'px';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = (Math.random() * 0.5) + 's';

            confettiContainer.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

// ===== INTERACTIVE EYES (FOLLOW CURSOR) =====
let eyeFollowEnabled = true;

document.addEventListener('mousemove', (e) => {
    if (!eyeFollowEnabled) return;

    const pupils = document.querySelectorAll('.pupil');
    const eyes = document.querySelectorAll('.eye');

    eyes.forEach((eye, index) => {
        const rect = eye.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;

        const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
        const distance = Math.min(10, Math.hypot(e.clientX - eyeX, e.clientY - eyeY) / 20);

        const pupilX = Math.cos(angle) * distance;
        const pupilY = Math.sin(angle) * distance;

        pupils[index].style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
    });
});

// Disable eye follow when speaking
speakBtn.addEventListener('click', () => {
    eyeFollowEnabled = !isSpeaking;
});

// ===== INITIALIZE =====
function init() {
    // Set initial avatar style
    updateAvatarStyle();
    updateBackgroundColor();

    // Add welcome animation
    setTimeout(() => {
        createMultipleSparkles(avatar, 15);
    }, 500);
}

// Run initialization when page loads
window.addEventListener('load', init);

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!generateBtn.disabled) {
            generateBtn.click();
        }
    }

    // Ctrl/Cmd + S to speak
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!speakBtn.disabled) {
            speakBtn.click();
        }
    }
});

// ===== SAVE STATE TO LOCAL STORAGE =====
function saveState() {
    const state = {
        name: nameInput.value,
        age: ageSelect.value,
        hobby: hobbyInput.value,
        favoriteColor: colorInput.value,
        dreamJob: dreamJobInput.value,
        extraPoints: extraPointsInput.value,
        style: currentAvatarStyle,
        color: currentBackgroundColor,
        apiKey: apiKeyInput.value
    };
    localStorage.setItem('aiAvatarState', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('aiAvatarState');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            if (state.name) nameInput.value = state.name;
            if (state.age) ageSelect.value = state.age;
            if (state.hobby) hobbyInput.value = state.hobby;
            if (state.favoriteColor) colorInput.value = state.favoriteColor;
            if (state.dreamJob) dreamJobInput.value = state.dreamJob;
            if (state.extraPoints) extraPointsInput.value = state.extraPoints;
            if (state.style) {
                currentAvatarStyle = state.style;
                styleButtons.forEach(btn => {
                    if (btn.dataset.style === state.style) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
            if (state.color) {
                currentBackgroundColor = state.color;
                colorPicker.value = state.color;
            }
            if (state.apiKey) apiKeyInput.value = state.apiKey;

            // Update UI
            if (state.name) avatarName.textContent = state.name;
            updateAvatarStyle();
            updateBackgroundColor();
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    }
}

// Auto-save on input changes
nameInput.addEventListener('input', saveState);
ageSelect.addEventListener('change', saveState);
hobbyInput.addEventListener('input', saveState);
colorInput.addEventListener('input', saveState);
dreamJobInput.addEventListener('input', saveState);
extraPointsInput.addEventListener('input', saveState);
apiKeyInput.addEventListener('input', saveState);

// Load saved state on page load
window.addEventListener('load', loadState);

// ===== CHATBOT FUNCTIONALITY =====
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');
const chatContainer = document.getElementById('chatContainer');

// Conversation history for context
let conversationHistory = [];

// Send message on button click
sendChatBtn.addEventListener('click', sendChatMessage);

// Send message on Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
});

// Clear chat
clearChatBtn.addEventListener('click', () => {
    if (confirm('🗑️ Are you sure you want to clear the chat?')) {
        // Keep only the initial AI message
        const initialMessage = chatMessages.querySelector('.ai-message');
        chatMessages.innerHTML = '';
        chatMessages.appendChild(initialMessage);
        conversationHistory = [];
        createSparkles(clearChatBtn);
    }
});

async function sendChatMessage() {
    const message = chatInput.value.trim();

    if (!message) {
        chatInput.focus();
        return;
    }

    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('🔑 Please enter your Gemini API key first in the AI Settings section above!');
        apiKeyInput.focus();
        return;
    }

    // Clear input
    chatInput.value = '';

    // Add user message to chat
    addMessageToChat(message, 'user');

    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        parts: [{ text: message }]
    });

    // Show typing indicator
    typingIndicator.classList.remove('hidden');
    scrollToBottom();

    // Disable send button
    sendChatBtn.disabled = true;

    try {
        // Get AI response
        const response = await getChatResponse(message, apiKey);

        // Hide typing indicator
        typingIndicator.classList.add('hidden');

        // Add AI response to chat
        addMessageToChat(response, 'ai');

        // Add to conversation history
        conversationHistory.push({
            role: 'model',
            parts: [{ text: response }]
        });

    } catch (error) {
        console.error('Chat error:', error);
        typingIndicator.classList.add('hidden');
        addMessageToChat('😢 Oops! Something went wrong. Please try again!', 'ai');
    } finally {
        sendChatBtn.disabled = false;
        chatInput.focus();
    }
}

async function getChatResponse(userMessage, apiKey) {
    // Check if the message contains math-related keywords
    const isMathQuestion = /\b(calculate|solve|what is|how much|plus|minus|times|divided|multiply|add|subtract|\d+\s*[\+\-\*\/\×\÷]\s*\d+|math|equation)\b/i.test(userMessage);

    // Build conversation context
    const systemPrompt = `You are a friendly, helpful AI assistant for kids. You should:
- Use simple, easy-to-understand language
- Be encouraging and positive
- Make learning fun
- Use emojis occasionally to be friendly
- Keep responses concise (2-4 sentences usually)
- Be safe and appropriate for children aged 5-12
- Help with homework, answer questions, tell jokes, or just chat
${isMathQuestion ? '- For math problems, ALWAYS show your work step by step and double-check calculations' : ''}

Now, please respond to this message: ${userMessage}`;

    const contents = [
        {
            role: 'user',
            parts: [{
                text: systemPrompt
            }]
        }
    ];

    // Add conversation history for context (last 5 exchanges)
    const recentHistory = conversationHistory.slice(-10);
    if (recentHistory.length > 0) {
        contents.push(...recentHistory);
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });
    }

    const requestBody = {
        contents: conversationHistory.length === 0 ? contents : [
            ...recentHistory,
            {
                role: 'user',
                parts: [{ text: userMessage }]
            }
        ],
        generationConfig: {
            temperature: isMathQuestion ? 0.1 : 0.8, // Lower temperature for math accuracy
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 400,
        },
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
        ]
    };

    // Enable code execution for math questions
    if (isMathQuestion) {
        requestBody.tools = [{
            codeExecution: {}
        }];
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response');
    }

    const data = await response.json();

    // Extract text from response (handle code execution results)
    let responseText = '';
    const parts = data.candidates[0].content.parts;

    for (const part of parts) {
        if (part.text) {
            responseText += part.text;
        }
        if (part.executableCode) {
            responseText += `\n\n💻 Code:\n${part.executableCode.code}`;
        }
        if (part.codeExecutionResult) {
            responseText += `\n\n✅ Result: ${part.codeExecutionResult.output}`;
        }
    }

    return responseText.trim();
}

function addMessageToChat(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'ai' ? '🤖' : '😊';

    const content = document.createElement('div');
    content.className = 'message-content';

    const text = document.createElement('p');
    text.textContent = message;

    content.appendChild(text);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
}

// Auto-focus chat input when scrolled into view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            chatInput.focus();
        }
    });
}, { threshold: 0.5 });

observer.observe(chatContainer);
