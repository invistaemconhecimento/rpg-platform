function initChatModule() {
    console.log('Inicializando módulo de chat...');
    
    const sendBtn = document.getElementById('send-message');
    const input = document.getElementById('message-input');
    
    if (sendBtn && input) {
        sendBtn.addEventListener('click', sendChatMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }
    
    updateChatDisplay();
    
    // Simular atualização periódica (em produção, use WebSockets)
    setInterval(updateChatDisplay, 5000);
}

function sendChatMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatMessage = {
        id: Date.now(),
        text: message,
        sender: AppState.currentUser,
        timestamp: new Date().toISOString(),
        type: 'chat'
    };
    
    AppState.chatMessages.push(chatMessage);
    input.value = '';
    
    // Salvar no JSONBin
    saveToJSONBin('chat', AppState.chatMessages).then(success => {
        if (success) {
            updateChatDisplay();
        }
    });
}

function updateChatDisplay() {
    const messagesDiv = document.getElementById('chat-messages');
    if (!messagesDiv) return;
    
    // Ordenar por timestamp (mais recentes primeiro)
    const sortedMessages = [...AppState.chatMessages].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    ).slice(0, 50); // Limitar a 50 mensagens
    
    messagesDiv.innerHTML = '';
    
    if (sortedMessages.length === 0) {
        messagesDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #888;">
                <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Nenhuma mensagem</h3>
                <p>Seja o primeiro a falar!</p>
            </div>
        `;
        return;
    }
    
    // Mostrar do mais antigo para o mais recente (para rolagem)
    sortedMessages.reverse().forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message';
        
        const time = new Date(msg.timestamp);
        const timeStr = time.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const isCurrentUser = msg.sender === AppState.currentUser;
        
        msgDiv.style.cssText = `
            margin-bottom: 15px;
            padding: 10px 15px;
            background: ${isCurrentUser ? '#2d3a5a' : '#1a2a3a'};
            border-radius: 10px;
            border-left: 4px solid ${isCurrentUser ? '#ff9800' : '#5e35b1'};
            max-width: 80%;
            margin-left: ${isCurrentUser ? 'auto' : '0'};
        `;
        
        msgDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong style="color: ${isCurrentUser ? '#ff9800' : '#5e35b1'};">${msg.sender}</strong>
                <small style="color: #888;">${timeStr}</small>
            </div>
            <div style="color: #ccc;">${msg.text}</div>
        `;
        
        messagesDiv.appendChild(msgDiv);
    });
    
    // Rolar para o final
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

window.sendChatMessage = sendChatMessage;
