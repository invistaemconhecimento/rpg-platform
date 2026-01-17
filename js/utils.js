// =================== FUNÇÕES UTILITÁRIAS ===================
const Utils = {
    // Gerar ID único
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Formatar data e hora
    formatDateTime: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR');
    },

    // Tempo relativo (ex: "há 5 minutos")
    getTimeAgo: function(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `${diffMins} min atrás`;
        if (diffHours < 24) return `${diffHours} h atrás`;
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;
        
        return date.toLocaleDateString('pt-BR');
    },

    // Rolar dados
    rollDice: function(sides) {
        return Math.floor(Math.random() * sides) + 1;
    },

    // Calcular modificador de atributo
    calculateAttributeModifier: function(score) {
        return Math.floor((score - 10) / 2);
    },

    // Formatar modificador
    formatModifier: function(mod) {
        return mod >= 0 ? `+${mod}` : `${mod}`;
    },

    // Calcular custo de pontos de atributo
    getAttributeCost: function(score) {
        const costTable = {
            8: 0, 9: 1, 10: 2, 11: 3, 12: 4,
            13: 5, 14: 7, 15: 9, 16: 11, 17: 13, 18: 15
        };
        return costTable[score] !== undefined ? costTable[score] : 0;
    },

    // Capitalizar primeira letra
    capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Validar e-mail (simples)
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Formatar número com separador de milhar
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    // Clonar objeto (deep clone simples)
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Debounce para otimizar chamadas de função
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Ordenar array por propriedade
    sortByProperty: function(array, property, ascending = true) {
        return array.sort((a, b) => {
            if (a[property] < b[property]) return ascending ? -1 : 1;
            if (a[property] > b[property]) return ascending ? 1 : -1;
            return 0;
        });
    },

    // Filtrar array por múltiplos critérios
    filterArray: function(array, filters) {
        return array.filter(item => {
            return Object.keys(filters).every(key => {
                if (filters[key] === 'all') return true;
                if (key.includes('-')) {
                    const [min, max] = filters[key].split('-').map(Number);
                    return item[key] >= min && item[key] <= max;
                }
                return item[key] == filters[key];
            });
        });
    },

    // Salvar no localStorage com tratamento de erro
    saveToLocalStorage: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Erro ao salvar ${key}:`, error);
            return false;
        }
    },

    // Carregar do localStorage com tratamento de erro
    loadFromLocalStorage: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Erro ao carregar ${key}:`, error);
            return null;
        }
    },

    // Mostrar mensagem de erro
    showError: function(message, elementId = null) {
        console.error(message);
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = message;
                element.style.color = '#ff6b6b';
                element.style.display = 'block';
                setTimeout(() => {
                    element.style.display = 'none';
                }, 5000);
            }
        }
    },

    // Mostrar mensagem de sucesso
    showSuccess: function(message, elementId = null) {
        console.log(message);
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = message;
                element.style.color = '#6bcf7f';
                element.style.display = 'block';
                setTimeout(() => {
                    element.style.display = 'none';
                }, 5000);
            }
        }
    }
};

// Exportar para uso global
window.Utils = Utils;
