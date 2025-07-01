let produtosJSON = {};
let categoriaAtual = "cachorros";
let produtosFiltrados = [];
let carrinho = [];

const produtosLista = document.getElementById("produtos-lista");
const carrinhoLista = document.getElementById("carrinho-lista");
const carrinhoTotal = document.getElementById("carrinho-total");
const carrinhoContador = document.getElementById("carrinho-contador");
const carrinhoBtn = document.getElementById("carrinho-btn");
const carrinhoPopup = document.getElementById("carrinho-popup");

// Carrega JSON externo
fetch('produtos.json')
  .then(res => res.json())
  .then(data => {
    produtosJSON = data;
    mostrarProdutos(categoriaAtual);
  })
  .catch(err => console.error('Erro ao carregar JSON:', err));

function mostrarProdutos(categoria) {
  categoriaAtual = categoria;

  if (categoria === "todos") {
    produtosFiltrados = [
      ...produtosJSON.cachorros,
      ...produtosJSON.gatos,
      ...produtosJSON.outros
    ];
  } else {
    produtosFiltrados = produtosJSON[categoria] || [];
  }

  renderizarLista();
}

function renderizarLista() {
  produtosLista.innerHTML = "";

  if (produtosFiltrados.length === 0) {
    produtosLista.innerHTML = "<p>Nenhum produto disponível</p>";
    return;
  }

  produtosFiltrados.forEach(p => {
    const div = document.createElement("div");
    div.className = "produto-item";
    div.innerHTML = `
      <img src="${p.imagem}" alt="${p.nome}" />
      <div class="produto-info">
        <h3>${p.nome}</h3>
        <p>R$ ${p.preco.toFixed(2).replace('.', ',')}</p>
        <button onclick="adicionarCarrinho(${p.id})">Comprar</button>
      </div>
    `;
    produtosLista.appendChild(div);
  });
}

function adicionarCarrinho(id) {
  const prod = produtosFiltrados.find(item => item.id === id);
  let item = carrinho.find(i => i.id === id);

  if (item) item.quantidade++;
  else carrinho.push({ ...prod, quantidade: 1 });

  atualizarCarrinho();
}

function atualizarCarrinho() {
  carrinhoLista.innerHTML = "";
  let total = 0;
  let totalItens = 0;

  carrinho.forEach((item, index) => {
  const li = document.createElement("li");

  const img = document.createElement("img");
  img.src = item.imagem;
  img.alt = item.nome;

  const info = document.createElement("div");
  info.classList.add("info");
  info.innerHTML = `
    <span>${item.nome}</span>
    <span>Qtd: ${item.quantidade}</span>
    <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
  `;

  const btnRemover = document.createElement("button");
  btnRemover.textContent = "Remover";
  btnRemover.onclick = () => {
    carrinho.splice(index, 1);
    atualizarCarrinho();
  };

  li.appendChild(img);
  li.appendChild(info);
  li.appendChild(btnRemover);
  carrinhoLista.appendChild(li);

  total += item.preco * item.quantidade;
  totalItens += item.quantidade;
});

  carrinhoTotal.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
  carrinhoContador.textContent = totalItens;
}

// Toggle visibilidade do popup do carrinho
carrinhoBtn.addEventListener("click", () => {
  carrinhoPopup.classList.toggle("visivel");
});

document.getElementById("finalizar-compra").addEventListener("click", () => {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  let mensagem = "*Pedido via site PetShop:*\n\n";
  carrinho.forEach(item => {
    mensagem += `• ${item.nome} - Qtd: ${item.quantidade} - R$ ${(item.preco * item.quantidade).toFixed(2)}\n ***Por favor enviar localização FIXA***`;
  });

  let total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  mensagem += `\n*Total:* R$ ${total.toFixed(2)}`;

  const telefone = "5521965497744"; // DDI + DDD + número
  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
});
function finalizarCompra() {
  const estoque = JSON.parse(localStorage.getItem('estoquePetshop'));

  // Atualiza estoque
  carrinho.forEach(item => {
    for (let categoria in estoque) {
      const prodIndex = estoque[categoria].findIndex(p => p.id === item.id);
      if (prodIndex !== -1) {
        estoque[categoria][prodIndex].quantidade -= item.quantidade;
        if (estoque[categoria][prodIndex].quantidade < 0) {
          estoque[categoria][prodIndex].quantidade = 0;
        }
        break;
      }
    }
  });

  // Salva o estoque atualizado
  localStorage.setItem('estoquePetshop', JSON.stringify(estoque));

  // Monta a mensagem para WhatsApp
  let mensagem = "Olá! Gostaria de fazer o pedido:\n";
  let totalCompra = 0;
  carrinho.forEach(item => {
    const subtotal = item.preco * item.quantidade;
    totalCompra += subtotal;
    mensagem += `- ${item.nome} (Qtd: ${item.quantidade}) - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
  });
  mensagem += `Total: R$ ${totalCompra.toFixed(2).replace('.', ',')} **Por favor enviar localização FIXA**`;

  // Limpa o carrinho e atualiza UI
  carrinho = [];
  atualizarCarrinho();

  // Abre WhatsApp com mensagem
  const numero = "5521965497744"; // código do Brasil + DDD + número
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}