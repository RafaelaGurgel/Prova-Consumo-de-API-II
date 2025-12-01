document.addEventListener('DOMContentLoaded', function() {
    const loadButton = document.getElementById('loadUsers');
    const userList = document.getElementById('userList');
    const errorMessage = document.getElementById('errorMessage');
    
    const API_URL = 'https://jsonplaceholder.typicode.com/users';
    
    async function loadUsers() {
        try {
            // Esconder mensagens de erro anteriores
            errorMessage.style.display = 'none';
            
            // Limpar lista existente
            userList.innerHTML = '';
            
            // Mostrar indicador de carregamento
            userList.innerHTML = '<li>Carregando usuários...</li>';
            
            const response = await fetch(API_URL);
            
            // Verificar se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
            }
            
            const users = await response.json();
            
            // Limpar indicador de carregamento
            userList.innerHTML = '';
            
            if (users.length === 0) {
                userList.innerHTML = '<li>Nenhum usuário encontrado.</li>';
                return;
            }
            
            // Criar elementos para cada usuário
            users.forEach(user => {
                const listItem = document.createElement('li');
                listItem.className = 'userItem';
                listItem.innerHTML = `
                    <strong>Nome:</strong> ${user.name}<br>
                    <strong>Email:</strong> ${user.email}<br>
                    <strong>Cidade:</strong> ${user.address.city}
                `;
                userList.appendChild(listItem);
            });
            
        } catch (error) {
            console.error('Erro:', error);
            
            // Mostrar mensagem de erro amigável
            errorMessage.textContent = 'Erro ao carregar os usuários. Tente novamente mais tarde.';
            errorMessage.style.display = 'block';
            
            // Limpar lista
            userList.innerHTML = '<li>Não foi possível carregar os usuários.</li>';
        }
    }
    
    // Adicionar evento de clique ao botão
    loadButton.addEventListener('click', loadUsers);
});
