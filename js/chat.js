function initChatModule() {
    const sendButton = document.getElementById('send-message');
    const messageInput = document.getElementById('message-input');
    
    if (sendButton && messageInput) {
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    updateChatMessages();
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const newMessage = {
        id: Date.now(),
        text: message,
        sender: AppState.currentUser || 'Jogador',
        timestamp: new Date().toISOString(),
        type: 'chat'
    };
    
    AppState.chatMessages.push(newMessage);
    input.value = '';
    
    // Exibir localmente
    displayMessage(newMessage);
    
    // Em uma versão completa, aqui enviaria para o servidor
    // saveToJSONBin('chat', AppState.chatMessages);
}

function displayMessage(message) {
    const messagesContainer = document.getElementById('chat-messages');
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="message-sender">${message.sender}</span>
            <span class="message-time">${new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div class="message-content">${message.text}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateChatMessages() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    AppState.chatMessages.forEach(message => {
        displayMessage(message);
    });
}
