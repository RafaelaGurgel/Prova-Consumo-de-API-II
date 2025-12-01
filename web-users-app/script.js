const btn = document.getElementById('btnCarregar');
const lista = document.getElementById('listaUsuarios');
const msgErro = document.getElementById('erro');


btn.addEventListener('click', carregarUsuarios);


async function carregarUsuarios() {
lista.innerHTML = "";
msgErro.textContent = "";


try {
const response = await fetch('https://jsonplaceholder.typicode.com/users');


if (!response.ok) {
throw new Error('Erro na resposta da API');
}


const dados = await response.json();


dados.forEach(usuario => {
const li = document.createElement('li');
li.textContent = `${usuario.name} — ${usuario.email}`;
lista.appendChild(li);
});


} catch (erro) {
msgErro.textContent = "Erro ao carregar os usuários, tente novamente mais tarde.";
console.error(erro);
}
}
