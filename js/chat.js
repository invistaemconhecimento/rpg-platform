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
        msgDiv.className = 'chat-m
