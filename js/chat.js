document.addEventListener('DOMContentLoaded', () => {
    const chatbotWrapper = document.getElementById('chatbot-wrapper');
    const chatbotToggler = document.getElementById('chatbot-toggler');
    const closeBtn = document.getElementById('chatbot-close');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chatbot-messages');

    // API Endpoint (change this if deployed)
    const API_URL = 'http://localhost:3000/api/chat';

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

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: messagesHistory })
            });

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
            typingElement.remove();
            appendMessage('bot', "Sorry, I'm having trouble connecting to the server. Please try again later.");
        }
    }

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-msg', sender);

        // Basic markdown conversion (links and bold)
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

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
