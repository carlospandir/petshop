let produtos = {};

function carregarProdutos() {
  // Pegar do localStorage primeiro (se já existir)
  const estoqueSalvo = localStorage.getItem('estoquePetshop');
  if (estoqueSalvo) {
    produtos = JSON.parse(estoqueSalvo);
    renderizarEstoque();
  } else {
    // Se não, carregar do JSON original e criar estoque padrão
    fetch('../loja/produtos.json')
      .then(response => response.json())
      .then(data => {
        produtos = data;
        // Inicializar estoque com quantidade 10 pra cada produto
        Object.keys(produtos).forEach(categoria => {
          produtos[categoria] = produtos[categoria].map(prod => ({ ...prod, quantidade: 10 }));
        });
        salvarEstoque();
        renderizarEstoque();
      })
      .catch(err => {
        document.getElementById('estoque').innerHTML = '<p>Erro ao carregar produtos.</p>';
        console.error(err);
      });
  }
}

function salvarEstoque() {
  localStorage.setItem('estoquePetshop', JSON.stringify(produtos));
}

function alterarQuantidade(categoria, id, novaQuantidade) {
  const cat = produtos[categoria];
  const prodIndex = cat.findIndex(p => p.id === id);
  if (prodIndex !== -1) {
    produtos[categoria][prodIndex].quantidade = novaQuantidade;
    salvarEstoque();
  }
}

function renderizarEstoque() {
  const container = document.getElementById('estoque');
  container.innerHTML = '';

  Object.keys(produtos).forEach(categoria => {
    const titulo = document.createElement('h2');
    titulo.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
    container.appendChild(titulo);

    produtos[categoria].forEach(prod => {
      const div = document.createElement('div');
      div.className = 'produto';

      div.innerHTML = `
        <img src="${prod.imagem}" alt="${prod.nome}" />
        <h3>${prod.nome}</h3>
        <p>Preço: R$ ${prod.preco.toFixed(2)}</p>
        <label>Quantidade no estoque: 
          <input type="number" min="0" value="${prod.quantidade}" data-categoria="${categoria}" data-id="${prod.id}" />
        </label>
      `;

      container.appendChild(div);
    });
  });

  // Adicionar evento para inputs de quantidade
  const inputs = container.querySelectorAll('input[type=number]');
  inputs.forEach(input => {
    input.addEventListener('change', e => {
      const novaQtd = parseInt(e.target.value, 10);
      const categoria = e.target.getAttribute('data-categoria');
      const id = parseInt(e.target.getAttribute('data-id'), 10);
      if (!isNaN(novaQtd) && novaQtd >= 0) {
        alterarQuantidade(categoria, id, novaQtd);
      } else {
        // Se for inválido, volta ao valor anterior
        const prod = produtos[categoria].find(p => p.id === id);
        e.target.value = prod.quantidade;
      }
    });
  });
}

carregarProdutos();