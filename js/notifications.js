// =================== SISTEMA DE NOTIFICAÇÕES ===================
const Notifications = {
    // Lista de notificações
    notifications: [],
    
    // Configurações
    autoClearTime: 5000, // 5 segundos
    maxNotifications: 50,
    
    // =================== FUNÇÕES PRINCIPAIS ===================
    
    // Adicionar notificação
    addNotification: function(title, message, type = 'info', autoClear = false, timeout = null) {
        const notification = {
            id: Utils.generateId(),
            title: title,
            message: message,
            type: type,
            time: new Date().toISOString(),
            read: false
        };
        
        this.notifications.unshift(notification);
        this.updateNotificationDisplay();
        this.updateNotificationBadge();
        
        // Limitar quantidade
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.pop();
        }
        
        // Auto-clear se configurado
        if (autoClear) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, timeout || this.autoClearTime);
        }
        
        // Salvar dados
        DataSystem.saveAllDataDebounced();
        
        return notification.id;
    },
    
    // Remover notificação
    removeNotification: function(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationDisplay();
        this.updateNotificationBadge();
        
        // Salvar dados
        DataSystem.saveAllDataDebounced();
    },
    
    // Marcar como lida
    markAsRead: function(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationBadge();
            DataSystem.saveAllDataDebounced();
        }
    },
    
    // Marcar todas como lidas
    markAllAsRead: function() {
        this.notifications.forEach(n => n.read = true);
        this.updateNotificationBadge();
        DataSystem.saveAllDataDebounced();
        
        this.addNotification('Notificações lidas', 'Todas as notificações foram marcadas como lidas', 'info', true);
    },
    
    // Limpar todas as notificações
    clearAllNotifications: function() {
        if (this.notifications.length === 0) return;
        
        if (confirm(`Tem certeza que deseja limpar todas as ${this.notifications.length} notificações?`)) {
            this.notifications = [];
            this.updateNotificationDisplay();
            this.updateNotificationBadge();
            this.addNotification('Notificações limpas', 'Todas as notificações foram removidas', 'info', true);
        }
    },
    
    // =================== FUNÇÕES DE DISPLAY ===================
    
    // Atualizar exibição de notificações
    updateNotificationDisplay: function() {
        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) return;
        
        notificationsList.innerHTML = '';
        
        if (this.notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="notification-item info">
                    <div class="notification-icon">
                        <i class="fas fa-bell-slash"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">Sem notificações</div>
                        <div class="notification-message">Nenhuma notificação no momento</div>
                    </div>
                </div>
            `;
            return;
        }
        
        this.notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.type}`;
            notificationItem.setAttribute('data-notification-id', notification.id);
            
            // Ícone baseado no tipo
            let icon = 'info-circle';
            if (notification.type === 'success') icon = 'check-circle';
            if (notification.type === 'warning') icon = 'exclamation-triangle';
            if (notification.type === 'danger') icon = 'exclamation-circle';
            if (notification.type === 'combat') icon = 'swords';
            if (notification.type === 'dice') icon = 'dice-d20';
            
            notificationItem.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${Utils.getTimeAgo(notification.time)}</div>
                </div>
                <button class="delete-notification-btn" onclick="Notifications.removeNotification('${notification.id}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Adicionar evento de clique para marcar como lida
            notificationItem.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-notification-btn')) {
                    this.markAsRead(notification.id);
                }
            });
            
            notificationsList.appendChild(notificationItem);
        });
    },
    
    // Atualizar badge de notificações
    updateNotificationBadge: function() {
        const notificationCount = document.getElementById('notificationCount');
        if (!notificationCount) return;
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        notificationCount.textContent = unreadCount;
        notificationCount.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    },
    
    // =================== NOTIFICAÇÕES PRÉ-DEFINIDAS ===================
    
    // Notificação de combate iniciado
    notifyCombatStart: function() {
        return this.addNotification(
            '⚔️ Combate Iniciado!',
            'O sistema de combate foi ativado. Adicione inimigos e role iniciativa.',
            'combat',
            false
        );
    },
    
    // Notificação de iniciativa rolada
    notifyInitiativeRolled: function() {
        return this.addNotification(
            '🎲 Iniciativa Rolada',
            'A ordem de combate foi definida. Prepare-se para o primeiro turno!',
            'dice',
            true,
            3000
        );
    },
    
    // Notificação de crítico
    notifyCriticalHit: function(resultText) {
        return this.addNotification(
            '🎯 CRÍTICO!',
            resultText,
            'success',
            true,
            4000
        );
    },
    
    // Notificação de falha crítica
    notifyCriticalFail: function(resultText) {
        return this.addNotification(
            '💀 FALHA CRÍTICA!',
            resultText,
            'danger',
            true,
            4000
        );
    },
    
    // Notificação de ficha criada
    notifySheetCreated: function(sheetName) {
        return this.addNotification(
            '📄 Ficha Criada',
            `${sheetName} foi criado com sucesso!`,
            'success',
            true,
            3000
        );
    },
    
    // Notificação de ação registrada
    notifyActionRegistered: function(userName) {
        return this.addNotification(
            '📝 Ação Registrada',
            `${userName} registrou uma nova ação no diário`,
            'info',
            true,
            2000
        );
    },
    
    // Notificação de dados rolados
    notifyDiceRolled: function(resultText) {
        return this.addNotification(
            '🎲 Dados Rolados',
            resultText,
            'dice',
            true,
            3000
        );
    },
    
    // =================== INICIALIZAÇÃO ===================
    
    init: function() {
        console.log('Notifications inicializado');
        // Carregar notificações do DataSystem
        this.notifications = DataSystem.notifications || [];
        this.updateNotificationDisplay();
        this.updateNotificationBadge();
        
        // Configurar event listeners
        this.setupEventListeners();
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        const clearNotificationsButton = document.getElementById('clearNotificationsButton');
        if (clearNotificationsButton) {
            clearNotificationsButton.addEventListener('click', () => {
                this.clearAllNotifications();
            });
        }
        
        // Botão para marcar todas como lidas (se existir)
        const markAllReadButton = document.getElementById('markAllReadButton');
        if (markAllReadButton) {
            markAllReadButton.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }
    }
};

// Exportar para uso global
window.Notifications = Notifications;
