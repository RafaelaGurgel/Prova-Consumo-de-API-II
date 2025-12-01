class UserManager {
    constructor() {
        this.API_URL = 'https://jsonplaceholder.typicode.com/users';
        this.users = [];
        this.filteredUsers = [];
        
        // Elementos DOM
        this.elements = {
            loadButton: document.getElementById('loadUsers'),
            clearButton: document.getElementById('clearUsers'),
            userList: document.getElementById('userList'),
            errorMessage: document.getElementById('errorMessage'),
            errorText: document.getElementById('errorText'),
            retryButton: document.getElementById('retryButton'),
            loading: document.getElementById('loading'),
            searchInput: document.getElementById('searchInput'),
            sortSelect: document.getElementById('sortSelect'),
            userCount: document.getElementById('userCount'),
            lastUpdate: document.getElementById('lastUpdate'),
            apiStatus: document.getElementById('apiStatus')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkAPIStatus();
        this.loadFromLocalStorage();
    }
    
    setupEventListeners() {
        this.elements.loadButton.addEventListener('click', () => this.loadUsers());
        this.elements.clearButton.addEventListener('click', () => this.clearUsers());
        this.elements.retryButton.addEventListener('click', () => this.loadUsers());
        this.elements.searchInput.addEventListener('input', () => this.filterUsers());
        this.elements.sortSelect.addEventListener('change', () => this.sortUsers());
    }
    
    async checkAPIStatus() {
        try {
            const response = await fetch(this.API_URL, { method: 'HEAD' });
            this.elements.apiStatus.textContent = 'Conectado';
            this.elements.apiStatus.className = 'status-indicator connected';
        } catch (error) {
            this.elements.apiStatus.textContent = 'Desconectado';
            this.elements.apiStatus.className = 'status-indicator disconnected';
        }
    }
    
    async loadUsers() {
        // Desabilitar botão durante o carregamento
        this.elements.loadButton.disabled = true;
        this.elements.loadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Carregando...</span>';
        
        // Mostrar loader
        this.showLoading();
        
        try {
            const response = await fetch(this.API_URL);
            
            // Verificar status da resposta
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Dados recebidos não são um array válido');
            }
            
            this.users = data;
            this.filteredUsers = [...this.users];
            
            // Salvar no localStorage
            this.saveToLocalStorage();
            
            // Atualizar interface
            this.renderUsers();
            this.updateStats();
            this.hideError();
            
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            this.showError(this.getErrorMessage(error));
            
            // Tentar carregar do localStorage
            if (this.users.length === 0) {
                this.loadFromLocalStorage();
            }
            
        } finally {
            // Restaurar botão
            this.elements.loadButton.disabled = false;
            this.elements.loadButton.innerHTML = '<i class="fas fa-sync-alt"></i><span>Carregar Usuários</span>';
            this.hideLoading();
        }
    }
    
    getErrorMessage(error) {
        if (error.message.includes('Failed to fetch')) {
            return 'Não foi possível conectar à API. Verifique sua conexão com a internet.';
        }
        
        if (error.message.includes('404')) {
            return 'API não encontrada (404). O endpoint pode ter mudado.';
        }
        
        if (error.message.includes('500')) {
            return 'Erro interno do servidor (500). Tente novamente mais tarde.';
        }
        
        return 'Erro ao carregar os usuários. Tente novamente mais tarde.';
    }
    
    renderUsers() {
        const userList = this.elements.userList;
        userList.innerHTML = '';
        
        if (this.filteredUsers.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-state';
            emptyItem.innerHTML = `
                <i class="fas fa-user-slash"></i>
                <p>${this.users.length === 0 ? 
                    'Nenhum usuário encontrado. Clique em "Carregar Usuários" para começar.' : 
                    'Nenhum usuário corresponde à sua busca.'}
                </p>
            `;
            userList.appendChild(emptyItem);
            return;
        }
        
        this.filteredUsers.forEach(user => {
            const listItem = document.createElement('li');
            listItem.className = 'user-item';
            
            // Primeira letra do nome para o avatar
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            
            listItem.innerHTML = `
                <div class="user-header">
                    <div class="user-avatar">${initials}</div>
                    <div class="user-info">
                        <h3>${user.name}</h3>
                        <div class="email">${user.email}</div>
                    </div>
                </div>
                <div class="user-details">
                    <div class="user-detail">
                        <i class="fas fa-building"></i>
                        <span>${user.company.name}</span>
                    </div>
                    <div class="user-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${user.address.city}, ${user.address.street}</span>
                    </div>
                    <div class="user-detail">
                        <i class="fas fa-phone"></i>
                        <span>${user.phone}</span>
                    </div>
                    <div class="user-detail">
                        <i class="fas fa-globe"></i>
                        <span>${user.website}</span>
                    </div>
                </div>
            `;
            
            userList.appendChild(listItem);
        });
    }
    
    filterUsers() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        
        if (!searchTerm) {
            this.filteredUsers = [...this.users];
        } else {
            this.filteredUsers = this.users.filter(user => 
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.company.name.toLowerCase().includes(searchTerm)
            );
        }
        
        this.sortUsers();
    }
    
    sortUsers() {
        const sortValue = this.elements.sortSelect.value;
        
        this.filteredUsers.sort((a, b) => {
            switch (sortValue) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'email-asc':
                    return a.email.localeCompare(b.email);
                case 'email-desc':
                    return b.email.localeCompare(a.email);
                default:
                    return 0;
            }
        });
        
        this.renderUsers();
    }
    
    clearUsers() {
        this.users = [];
        this.filteredUsers = [];
        this.renderUsers();
        this.updateStats();
        localStorage.removeItem('usersData');
        
        // Mostrar estado vazio
        const userList = this.elements.userList;
        userList.innerHTML = `
            <li class="empty-state">
                <i class="fas fa-user-slash"></i>
                <p>Nenhum usuário carregado ainda. Clique em "Carregar Usuários" para começar.</p>
            </li>
        `;
    }
    
    updateStats() {
        this.elements.userCount.textContent = `${this.users.length} usuário${this.users.length !== 1 ? 's' : ''}`;
        
        if (this.users.length > 0) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            this.elements.lastUpdate.textContent = `Última atualização: ${timeString}`;
        } else {
            this.elements.lastUpdate.textContent = 'Nunca atualizado';
        }
    }
    
    showLoading() {
        this.elements.loading.style.display = 'block';
    }
    
    hideLoading() {
        this.elements.loading.style.display = 'none';
    }
    
    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.style.display = 'flex';
    }
    
    hideError() {
        this.elements.errorMessage.style.display = 'none';
    }
    
    saveToLocalStorage() {
        const data = {
            users: this.users,
            timestamp: Date.now()
        };
        localStorage.setItem('usersData', JSON.stringify(data));
    }
    
    loadFromLocalStorage() {
        const savedData = localStorage.getItem('usersData');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                const oneHour = 60 * 60 * 1000;
                
                // Verificar se os dados têm menos de 1 hora
                if (Date.now() - data.timestamp < oneHour) {
                    this.users = data.users;
                    this.filteredUsers = [...this.users];
                    this.renderUsers();
                    this.updateStats();
                    
                    // Mostrar mensagem informativa
                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'info-message';
                    infoDiv.innerHTML = `
                        <i class="fas fa-info-circle"></i>
                        <span>Carregando dados salvos localmente (offline)</span>
                    `;
                    this.elements.userList.parentElement.insertBefore(infoDiv, this.elements.userList);
                    
                    setTimeout(() => infoDiv.remove(), 3000);
                }
            } catch (error) {
                console.error('Erro ao carregar dados do localStorage:', error);
            }
        }
    }
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const userManager = new UserManager();
    
    // Adicionar efeito de digitação no título
    const title = document.querySelector('.logo h1');
    const originalText = title.textContent;
    title.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < originalText.length) {
            title.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    };
    
    // Iniciar animação após um breve delay
    setTimeout(typeWriter, 500);
});
