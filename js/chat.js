document.addEventListener('DOMContentLoaded', () => {
    const chatbotWrapper = document.getElementById('chatbot-wrapper');
    const chatbotToggler = document.getElementById('chatbot-toggler');
    const closeBtn = document.getElementById('chatbot-close');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chatbot-messages');

    // API Endpoint (change this if deployed)
    const API_URL = 'https://portfolio-chatbot-backend-fy9h.onrender.com/api/chat';

    // Store conversation history
    let messagesHistory = [];

    // Toggle chat window
    chatbotToggler.addEventListener('click', () => {
        chatbotWrapper.classList.toggle('chat-active');
    });

    closeBtn.addEventListener('click', () => {
        chatbotWrapper.classList.remove('chat-active');
    });

    // Handle Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Handle Send button click
    sendBtn.addEventListener('click', sendMessage);

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Append user message
        appendMessage('user', text);
        chatInput.value = '';

        // Add to history
        messagesHistory.push({ role: 'user', content: text });

        // Show typing indicator
        const typingElement = showTypingIndicator();

        // Cold start timer — show a message if response takes too long
        const coldStartTimer = setTimeout(() => {
            const coldMsg = document.createElement('div');
            coldMsg.classList.add('chat-msg', 'bot');
            coldMsg.id = 'cold-start-msg';
            coldMsg.style.fontSize = '12px';
            coldMsg.style.opacity = '0.7';
            coldMsg.textContent = '⏳ Server is waking up, this may take up to 30 seconds...';
            chatMessages.appendChild(coldMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 5000);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: messagesHistory })
            });

            clearTimeout(coldStartTimer);
            const coldMsg = document.getElementById('cold-start-msg');
            if (coldMsg) coldMsg.remove();

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const botResponse = data.reply;

            // Remove typing indicator
            typingElement.remove();

            // Check for Resume Download Trigger
            const downloadTrigger = '[ACTION:DOWNLOAD_RESUME]';
            let displayText = botResponse;

            if (botResponse.includes(downloadTrigger)) {
                displayText = botResponse.replace(downloadTrigger, '').trim();

                // Trigger download programmatically
                triggerResumeDownload();
            }

            // Add bot response to UI
            appendMessage('bot', displayText);

            // Add to history
            messagesHistory.push({ role: 'assistant', content: botResponse });

        } catch (error) {
            console.error('Error fetching chat response:', error);
            clearTimeout(coldStartTimer);
            const coldMsg = document.getElementById('cold-start-msg');
            if (coldMsg) coldMsg.remove();
            typingElement.remove();
            appendMessage('bot', "Oops! The server might still be waking up. Please try again in a few seconds. 🔄");
        }
    }

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-msg', sender);

        // Basic markdown conversion (bold, markdown links, then raw URLs)
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/(?<!\href=")(https?:\/\/[^\s<>"']+)/g, (url) => {
                try {
                    const hostname = new URL(url).hostname.replace('www.', '');
                    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${hostname}</a>`;
                } catch {
                    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
                }
            });

        msgDiv.innerHTML = formattedText;
        chatMessages.appendChild(msgDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return typingDiv;
    }

    function triggerResumeDownload() {
        // The resume link from index.html (Drive link)
        const resumeUrl = 'https://drive.google.com/file/d/100rG_-Wn4gFZeXx3nsfljyOaT86XMCyy/view?usp=sharing';
        window.open(resumeUrl, '_blank');
    }
});
