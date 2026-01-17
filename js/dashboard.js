// =================== SISTEMA DE DASHBOARD E ESTATÍSTICAS ===================
const DashboardSystem = {
    // Gráfico de atividade
    activityChart: null,
    
    // =================== FUNÇÕES PRINCIPAIS ===================
    
    // Atualizar todas as estatísticas
    updateDashboardStats: function() {
        this.updatePlayerStats();
        this.updateRollStats();
        this.updateCombatStats();
        this.updateClassDistribution();
        this.updateActivityChart();
    },
    
    // Atualizar estatísticas de jogadores
    updatePlayerStats: function() {
        const uniquePlayers = new Set(DataSystem.messages.map(msg => msg.user_name));
        DataSystem.activityData.playerStats.active = uniquePlayers.size;
        DataSystem.activityData.playerStats.total = DataSystem.messages.filter(msg => msg.user_name).length;
        
        const activePlayersElement = document.getElementById('activePlayers');
        if (activePlayersElement) {
            activePlayersElement.textContent = DataSystem.activityData.playerStats.active;
        }
    },
    
    // Atualizar estatísticas de rolagens
    updateRollStats: function() {
        const today = new Date().toDateString();
        DataSystem.activityData.rollStats.today = DataSystem.diceResults.filter(roll => {
            const rollDate = new Date(roll.timestamp).toDateString();
            return rollDate === today;
        }).length;
        
        DataSystem.activityData.rollStats.criticals = DataSystem.diceResults.filter(roll => roll.isCritical).length;
        DataSystem.activityData.rollStats.fails = DataSystem.diceResults.filter(roll => roll.isCriticalFail).length;
        
        const rollsTodayElement = document.getElementById('rollsToday');
        const criticalHitsElement = document.getElementById('criticalHits');
        const criticalFailsElement = document.getElementById('criticalFails');
        
        if (rollsTodayElement) rollsTodayElement.textContent = DataSystem.activityData.rollStats.today;
        if (criticalHitsElement) criticalHitsElement.textContent = DataSystem.activityData.rollStats.criticals;
        if (criticalFailsElement) criticalFailsElement.textContent = DataSystem.activityData.rollStats.fails;
    },
    
    // Atualizar estatísticas de combate
    updateCombatStats: function() {
        const combatCount = DataSystem.isCombatActive ? 1 : 0;
        const enemyCount = DataSystem.combatParticipants.filter(p => p.type === 'enemy').length;
        const totalTurns = DataSystem.currentRound;
        
        const activeCombatsElement = document.getElementById('activeCombats');
        const totalEnemiesElement = document.getElementById('totalEnemies');
        const totalTurnsElement = document.getElementById('totalTurns');
        
        if (activeCombatsElement) activeCombatsElement.textContent = combatCount;
        if (totalEnemiesElement) totalEnemiesElement.textContent = enemyCount;
        if (totalTurnsElement) totalTurnsElement.textContent = totalTurns;
    },
    
    // Atualizar distribuição de classes
    updateClassDistribution: function() {
        const classDistributionElement = document.getElementById('classDistribution');
        if (!classDistributionElement) return;
        
        const classCounts = {};
        
        DataSystem.messages.forEach(msg => {
            if (msg.character_class) {
                classCounts[msg.character_class] = (classCounts[msg.character_class] || 0) + 1;
            }
        });
        
        // Ordenar por quantidade
        const sortedClasses = Object.entries(classCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        DataSystem.activityData.classDistribution = Object.fromEntries(sortedClasses);
        
        // Atualizar display
        classDistributionElement.innerHTML = '';
        
        if (sortedClasses.length === 0) {
            classDistributionElement.innerHTML = `
                <div class="loading" style="text-align: center; padding: 20px;">
                    <i class="fas fa-users"></i><br>
                    Nenhuma classe registrada ainda
                </div>
            `;
            return;
        }
        
        const maxCount = Math.max(...sortedClasses.map(c => c[1]));
        
        sortedClasses.forEach(([className, count]) => {
            const percentage = (count / maxCount) * 100;
            const classItem = document.createElement('div');
            classItem.className = 'class-item';
            classItem.innerHTML = `
                <div>
                    <div class="class-name">
                        <span>${className}</span>
                    </div>
                    <div class="class-bar">
                        <div class="class-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div class="class-count">${count}</div>
            `;
            classDistributionElement.appendChild(classItem);
        });
    },
    
    // Atualizar gráfico de atividade
    updateActivityChart: function() {
        const activityChartCanvas = document.getElementById('activityChartCanvas');
        if (!activityChartCanvas || !activityChartCanvas.getContext) {
            console.warn('Canvas não suportado ou não encontrado');
            return;
        }
        
        // Coletar dados por hora
        const hourlyData = new Array(24).fill(0);
        
        DataSystem.messages.forEach(msg => {
            const hour = new Date(msg.created_at).getHours();
            hourlyData[hour]++;
        });
        
        DataSystem.activityData.hourlyActivity = hourlyData;
        
        // Criar/atualizar gráfico
        const ctx = activityChartCanvas.getContext('2d');
        
        // Destruir gráfico anterior se existir
        if (this.activityChart) {
            this.activityChart.destroy();
        }
        
        this.activityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Atividade',
                    data: hourlyData,
                    borderColor: '#9d4edd',
                    backgroundColor: 'rgba(157, 78, 221, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ffd93d',
                    pointBorderColor: '#ffd93d',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(25, 25, 45, 0.9)',
                        titleColor: '#ffd93d',
                        bodyColor: '#b8c1ec',
                        borderColor: '#9d4edd',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(83, 52, 131, 0.2)'
                        },
                        ticks: {
                            color: '#8a8ac4',
                            maxTicksLimit: 6
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(83, 52, 131, 0.2)'
                        },
                        ticks: {
                            color: '#8a8ac4'
                        }
                    }
                }
            }
        });
    },
    
    // =================== FUNÇÕES DE ATUALIZAÇÃO ===================
    
    // Atualizar periodicamente
    startAutoUpdate: function() {
        // Atualizar a cada 30 segundos
        setInterval(() => {
            this.updateDashboardStats();
        }, 30000);
        
        // Salvar dados periodicamente
        setInterval(() => {
            DataSystem.saveAllDataDebounced();
        }, 60000);
    },
    
    // =================== INICIALIZAÇÃO ===================
    
    init: function() {
        console.log('DashboardSystem inicializado');
        
        // Atualizar estatísticas iniciais
        this.updateDashboardStats();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Iniciar atualização automática
        this.startAutoUpdate();
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Botão de atualizar estatísticas
        const refreshStatsButton = document.getElementById('refreshStatsButton');
        if (refreshStatsButton) {
            refreshStatsButton.addEventListener('click', () => {
                refreshStatsButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                this.updateDashboardStats();
                setTimeout(() => {
                    refreshStatsButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
                }, 500);
            });
        }
        
        // Botão de limpar notificações (já configurado em notifications.js)
        // Adicionar botão de exportar dados se não existir
        this.addExportButton();
    },
    
    // Adicionar botão de exportar dados
    addExportButton: function() {
        const notificationsHeader = document.querySelector('.notifications-header');
        if (notificationsHeader && !document.getElementById('exportDataButton')) {
            const exportButton = document.createElement('button');
            exportButton.id = 'exportDataButton';
            exportButton.className = 'btn-secondary btn-small';
            exportButton.innerHTML = '<i class="fas fa-download"></i> Exportar';
            exportButton.style.marginLeft = '10px';
            
            exportButton.addEventListener('click', () => {
                DataSystem.exportData();
            });
            
            notificationsHeader.appendChild(exportButton);
        }
    }
};

// Exportar para uso global
window.DashboardSystem = DashboardSystem;
