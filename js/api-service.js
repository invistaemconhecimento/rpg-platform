// Configuração do JSONBin.io - ATUALIZE COM SEUS DADOS!
const JSONBIN_CONFIG = {
    BIN_ID: 696c213d43b1c97be937a608, // Cole seu BIN ID
    API_KEY: $2a$10$bvBUVBhgKvyGIYRvNtACLegHqy58JUdWNGxQAqF3GDn6xLZJ7jzL6, // Cole sua Master Key
    BASE_URL: 'https://api.jsonbin.io/v3/b'
};

// Funções para interagir com JSONBin
async function fetchFromJSONBin(endpoint) {
    try {
        console.log('Fetching from JSONBin:', endpoint);
        
        const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        // Se for a primeira vez (bin vazio), retorna array vazio
        if (!data.record) {
            return [];
        }
        
        return data.record[endpoint] || [];
    } catch (error) {
        console.error(`Erro ao buscar ${endpoint}:`, error);
        // Retorna array vazio em caso de erro
        return [];
    }
}

async function saveToJSONBin(endpoint, data) {
    try {
        console.log('Salvando no JSONBin:', endpoint, data);
        
        // Primeiro, pegar todos os dados atuais
        const currentResponse = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!currentResponse.ok) {
            throw new Error('Erro ao buscar dados atuais');
        }
        
        const fullData = await currentResponse.json();
        const record = fullData.record || {};
        
        // Atualizar apenas o endpoint especificado
        record[endpoint] = data;
        
        // Salvar de volta
        const saveResponse = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}`, {
            method: 'PUT',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'Content-Type': 'application/json',
                'X-Bin-Versioning': 'false'
            },
            body: JSON.stringify(record)
        });
        
        if (!saveResponse.ok) {
            throw new Error('Erro ao salvar dados');
        }
        
        console.log('Dados salvos com sucesso!');
        return true;
    } catch (error) {
        console.error(`Erro ao salvar ${endpoint}:`, error);
        return false;
    }
}

// Exportar funções para uso global
window.fetchFromJSONBin = fetchFromJSONBin;
window.saveToJSONBin = saveToJSONBin;
window.JSONBIN_CONFIG = JSONBIN_CONFIG;
