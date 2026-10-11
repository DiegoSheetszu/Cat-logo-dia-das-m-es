const STORAGE_KEYS = {
  products: "docuras-vendas-products",
  sales: "docuras-vendas-sales",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

const defaultProducts = [
  {
    id: crypto.randomUUID(),
    name: "Caixinha com amor",
    type: "Mimo",
    salePrice: 15,
    costPrice: 6,
    stock: 18,
    notes: "Boa opção de entrada e ticket leve.",
  },
  {
    id: crypto.randomUUID(),
    name: "Caixa presente de doces finos",
    type: "Presente premium",
    salePrice: 60,
    costPrice: 27,
    stock: 10,
    notes: "Produto com alto valor percebido.",
  },
  {
    id: crypto.randomUUID(),
    name: "Caixa coração com brigadeiros",
    type: "Mimo romântico",
    salePrice: 20,
    costPrice: 8,
    stock: 16,
    notes: "Ideal para complementar pedidos.",
  },
  {
    id: crypto.randomUUID(),
    name: "Rosa com mensagem Mãe",
    type: "Presente criativo",
    salePrice: 25,
    costPrice: 10,
    stock: 12,
    notes: "Boa saída em campanhas sazonais.",
  },
  {
    id: crypto.randomUUID(),
    name: "Kit mini bolo e brigadeiros",
    type: "Kit",
    salePrice: 60,
    costPrice: 29,
    stock: 8,
    notes: "Produto com forte apelo visual para divulgação.",
  },
  {
    id: crypto.randomUUID(),
    name: "Kit bolo no acetato e brigadeiros",
    type: "Kit compacto",
    salePrice: 50,
    costPrice: 23,
    stock: 9,
    notes: "Boa conversão para presente rápido.",
  },
  {
    id: crypto.randomUUID(),
    name: "Cesta Mãe com balões",
    type: "Cesta premium",
    salePrice: 80,
    costPrice: 39,
    stock: 5,
    notes: "Item de maior impacto e valor.",
  },
  {
    id: crypto.randomUUID(),
    name: "Mini bolo com rosa",
    type: "Presente marcante",
    salePrice: 60,
    costPrice: 30,
    stock: 7,
    notes: "Ótimo para compor mesa e fotos.",
  },
];

const statsGrid = document.querySelector("#statsGrid");
const productForm = document.querySelector("#productForm");
const saleForm = document.querySelector("#saleForm");
const productsTableBody = document.querySelector("#productsTableBody");
const salesTableBody = document.querySelector("#salesTableBody");
const saleProductSelect = document.querySelector("#saleProduct");
const topProducts = document.querySelector("#topProducts");
const businessAlerts = document.querySelector("#businessAlerts");
const productMarginPreview = document.querySelector("#productMarginPreview");
const salePreview = document.querySelector("#salePreview");
const seedButton = document.querySelector("#seedButton");
const clearProductFormButton = document.querySelector("#clearProductForm");
const clearSaleFormButton = document.querySelector("#clearSaleForm");

const productFields = {
  id: document.querySelector("#productId"),
  name: document.querySelector("#productName"),
  type: document.querySelector("#productType"),
  stock: document.querySelector("#productStock"),
  price: document.querySelector("#productPrice"),
  cost: document.querySelector("#productCost"),
  notes: document.querySelector("#productNotes"),
};

const saleFields = {
  product: document.querySelector("#saleProduct"),
  quantity: document.querySelector("#saleQuantity"),
  date: document.querySelector("#saleDate"),
  unitPrice: document.querySelector("#saleUnitPrice"),
  channel: document.querySelector("#saleChannel"),
  customer: document.querySelector("#saleCustomer"),
  discount: document.querySelector("#saleDiscount"),
};

let state = {
  products: loadCollection(STORAGE_KEYS.products, defaultProducts),
  sales: loadCollection(STORAGE_KEYS.sales, []),
};

initialize();

function initialize() {
  saleFields.date.value = new Date().toISOString().slice(0, 10);
  bindEvents();
  renderAll();
}

function bindEvents() {
  productForm.addEventListener("submit", handleProductSubmit);
  saleForm.addEventListener("submit", handleSaleSubmit);
  seedButton.addEventListener("click", reseedProducts);
  clearProductFormButton.addEventListener("click", resetProductForm);
  clearSaleFormButton.addEventListener("click", resetSaleForm);

  [productFields.price, productFields.cost].forEach((field) => {
    field.addEventListener("input", renderProductMarginPreview);
  });

  [saleFields.quantity, saleFields.unitPrice, saleFields.discount].forEach((field) => {
    field.addEventListener("input", renderSalePreview);
  });

  saleFields.product.addEventListener("change", syncSaleProductDefaults);

  productsTableBody.addEventListener("click", handleProductsTableActions);
  salesTableBody.addEventListener("click", handleSalesTableActions);
}

function renderAll() {
  persistState();
  renderStats();
  renderProductOptions();
  renderProductsTable();
  renderSalesTable();
  renderTopProducts();
  renderAlerts();
  renderProductMarginPreview();
  renderSalePreview();
}

function loadCollection(key, fallback) {
  const rawValue = localStorage.getItem(key);

  if (!rawValue) {
    return structuredClone(fallback);
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.warn(`Falha ao ler ${key}:`, error);
    return structuredClone(fallback);
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(state.products));
  localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(state.sales));
}

function handleProductSubmit(event) {
  event.preventDefault();

  const product = {
    id: productFields.id.value || crypto.randomUUID(),
    name: productFields.name.value.trim(),
    type: productFields.type.value.trim(),
    stock: toNumber(productFields.stock.value),
    salePrice: toNumber(productFields.price.value),
    costPrice: toNumber(productFields.cost.value),
    notes: productFields.notes.value.trim(),
  };

  if (!product.name || !product.type) {
    return;
  }

  const existingIndex = state.products.findIndex((item) => item.id === product.id);

  if (existingIndex >= 0) {
    state.products[existingIndex] = product;
  } else {
    state.products.unshift(product);
  }

  resetProductForm();
  renderAll();
}

function handleSaleSubmit(event) {
  event.preventDefault();

  const selectedProduct = state.products.find((product) => product.id === saleFields.product.value);

  if (!selectedProduct) {
    return;
  }

  const quantity = Math.max(1, toNumber(saleFields.quantity.value));
  const unitPrice = toNumber(saleFields.unitPrice.value);
  const discount = toNumber(saleFields.discount.value);

  const sale = {
    id: crypto.randomUUID(),
    productId: selectedProduct.id,
    productName: selectedProduct.name,
    date: saleFields.date.value,
    quantity,
    unitPrice,
    unitCost: selectedProduct.costPrice,
    channel: saleFields.channel.value,
    customer: saleFields.customer.value.trim(),
    discount,
  };

  state.sales.unshift(sale);
  state.products = state.products.map((product) =>
    product.id === selectedProduct.id
      ? { ...product, stock: Math.max(0, product.stock - quantity) }
      : product
  );

  resetSaleForm();
  renderAll();
}

function handleProductsTableActions(event) {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const { action, id } = actionButton.dataset;
  const product = state.products.find((item) => item.id === id);

  if (!product) {
    return;
  }

  if (action === "edit") {
    productFields.id.value = product.id;
    productFields.name.value = product.name;
    productFields.type.value = product.type;
    productFields.stock.value = product.stock;
    productFields.price.value = product.salePrice;
    productFields.cost.value = product.costPrice;
    productFields.notes.value = product.notes || "";
    renderProductMarginPreview();
    productFields.name.focus();
  }

  if (action === "delete") {
    state.products = state.products.filter((item) => item.id !== id);
    state.sales = state.sales.filter((sale) => sale.productId !== id);
    renderAll();
  }
}

function handleSalesTableActions(event) {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const saleId = actionButton.dataset.id;
  const sale = state.sales.find((item) => item.id === saleId);

  if (!sale) {
    return;
  }

  if (actionButton.dataset.action === "delete") {
    state.sales = state.sales.filter((item) => item.id !== saleId);
    state.products = state.products.map((product) =>
      product.id === sale.productId
        ? { ...product, stock: product.stock + sale.quantity }
        : product
    );
    renderAll();
  }
}

function renderStats() {
  const salesSummary = summarizeSales();
  const topProduct = salesSummary.ranking[0];
  const marginAverage = average(
    state.products.map((product) => getMarginPercent(product.salePrice, product.costPrice))
  );

  const stats = [
    {
      label: "Faturamento",
      value: formatCurrency(salesSummary.revenue),
      note: `${numberFormatter.format(salesSummary.salesCount)} venda(s) registradas`,
    },
    {
      label: "Lucro estimado",
      value: formatCurrency(salesSummary.profit),
      note: `Margem média dos itens: ${marginAverage.toFixed(1)}%`,
    },
    {
      label: "Itens vendidos",
      value: numberFormatter.format(salesSummary.units),
      note: `Ticket médio: ${formatCurrency(salesSummary.averageTicket)}`,
    },
    {
      label: "Mais vendido",
      value: topProduct ? topProduct.name : "Sem dados",
      note: topProduct ? `${topProduct.quantity} unidade(s)` : "Registre sua primeira venda",
    },
    {
      label: "Estoque total",
      value: numberFormatter.format(state.products.reduce((total, product) => total + product.stock, 0)),
      note: `${state.products.length} item(ns) ativos`,
    },
  ];

  statsGrid.innerHTML = stats
    .map(
      (stat) => `
        <article class="stat-card">
          <p class="stat-label">${stat.label}</p>
          <p class="stat-value">${stat.value}</p>
          <p class="stat-note">${stat.note}</p>
        </article>
      `
    )
    .join("");
}

function renderProductOptions() {
  if (!state.products.length) {
    saleProductSelect.innerHTML = '<option value="">Cadastre um item primeiro</option>';
    return;
  }

  saleProductSelect.innerHTML = state.products
    .map(
      (product) => `
        <option value="${product.id}">
          ${product.name} · ${formatCurrency(product.salePrice)}
        </option>
      `
    )
    .join("");

  if (!state.products.some((product) => product.id === saleProductSelect.value)) {
    saleProductSelect.value = state.products[0].id;
  }

  syncSaleProductDefaults();
}

function renderProductsTable() {
  if (!state.products.length) {
    productsTableBody.innerHTML = '<tr><td colspan="7"><p class="empty-state">Nenhum item cadastrado ainda.</p></td></tr>';
    return;
  }

  productsTableBody.innerHTML = state.products
    .map((product) => {
      const margin = getMarginPercent(product.salePrice, product.costPrice);

      return `
        <tr>
          <td>
            <p class="table-title">${product.name}</p>
            <p class="table-subtitle">${product.notes || "Sem observações"}</p>
          </td>
          <td>${product.type}</td>
          <td>${formatCurrency(product.salePrice)}</td>
          <td>${formatCurrency(product.costPrice)}</td>
          <td>${margin.toFixed(1)}%</td>
          <td>${numberFormatter.format(product.stock)}</td>
          <td>
            <button class="table-action" type="button" data-action="edit" data-id="${product.id}">Editar</button>
            <button class="table-action" type="button" data-action="delete" data-id="${product.id}">Excluir</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderSalesTable() {
  if (!state.sales.length) {
    salesTableBody.innerHTML = '<tr><td colspan="7"><p class="empty-state">Nenhuma venda lançada ainda.</p></td></tr>';
    return;
  }

  salesTableBody.innerHTML = state.sales
    .map((sale) => {
      const total = sale.quantity * sale.unitPrice - sale.discount;
      const profit = sale.quantity * (sale.unitPrice - sale.unitCost) - sale.discount;

      return `
        <tr>
          <td>
            <p class="table-title">${formatDate(sale.date)}</p>
            <p class="table-subtitle">${sale.customer || sale.channel}</p>
          </td>
          <td>${sale.productName}</td>
          <td>${numberFormatter.format(sale.quantity)}</td>
          <td>${sale.channel}</td>
          <td>${formatCurrency(total)}</td>
          <td>${formatCurrency(profit)}</td>
          <td>
            <button class="table-action" type="button" data-action="delete" data-id="${sale.id}">Remover</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderTopProducts() {
  const ranking = summarizeSales().ranking;

  if (!ranking.length) {
    topProducts.innerHTML = '<p class="empty-state">Assim que você registrar vendas, o ranking aparece aqui.</p>';
    return;
  }

  const maxQuantity = ranking[0].quantity;

  topProducts.innerHTML = ranking
    .slice(0, 5)
    .map(
      (item) => `
        <article class="ranking-item">
          <header>
            <h3>${item.name}</h3>
            <strong>${item.quantity} un.</strong>
          </header>
          <p class="panel-subtle">${formatCurrency(item.revenue)} em vendas · ${formatCurrency(item.profit)} de lucro estimado</p>
          <div class="ranking-bar">
            <span style="width: ${(item.quantity / maxQuantity) * 100}%"></span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAlerts() {
  const productsWithLowMargin = state.products.filter(
    (product) => getMarginPercent(product.salePrice, product.costPrice) < 35
  );
  const lowStock = state.products.filter((product) => product.stock <= 3);
  const salesSummary = summarizeSales();
  const topChannel = getTopChannel();

  const alerts = [];

  if (salesSummary.salesCount === 0) {
    alerts.push({
      tone: "is-warning",
      title: "Nenhuma venda registrada ainda",
      text: "Comece lançando uma venda para ativar os indicadores de faturamento, ticket médio e ranking.",
    });
  } else {
    alerts.push({
      tone: "is-good",
      title: "Canal com melhor tração",
      text: topChannel
        ? `${topChannel.name} concentrou ${topChannel.count} venda(s) até agora.`
        : "Ainda não foi possível identificar o canal com melhor desempenho.",
    });
  }

  alerts.push({
    tone: lowStock.length ? "is-danger" : "is-good",
    title: lowStock.length ? "Itens com estoque apertado" : "Estoque sob controle",
    text: lowStock.length
      ? lowStock.map((product) => `${product.name} (${product.stock})`).join(" · ")
      : "Nenhum item está perto de zerar no momento.",
  });

  alerts.push({
    tone: productsWithLowMargin.length ? "is-warning" : "is-good",
    title: productsWithLowMargin.length ? "Margem abaixo do ideal" : "Margens saudáveis",
    text: productsWithLowMargin.length
      ? productsWithLowMargin
          .slice(0, 3)
          .map((product) => `${product.name} (${getMarginPercent(product.salePrice, product.costPrice).toFixed(1)}%)`)
          .join(" · ")
      : "Seus itens cadastrados estão acima da margem mínima sugerida.",
  });

  businessAlerts.innerHTML = alerts
    .map(
      (alert) => `
        <article class="alert-card ${alert.tone}">
          <header><h3>${alert.title}</h3></header>
          <p>${alert.text}</p>
        </article>
      `
    )
    .join("");
}

function renderProductMarginPreview() {
  const salePrice = toNumber(productFields.price.value);
  const costPrice = toNumber(productFields.cost.value);
  const margin = getMarginPercent(salePrice, costPrice);
  productMarginPreview.textContent = `Margem estimada: ${margin.toFixed(1)}% · Lucro por unidade: ${formatCurrency(
    Math.max(0, salePrice - costPrice)
  )}`;
}

function renderSalePreview() {
  const quantity = Math.max(1, toNumber(saleFields.quantity.value));
  const unitPrice = toNumber(saleFields.unitPrice.value);
  const discount = toNumber(saleFields.discount.value);
  const total = quantity * unitPrice - discount;

  salePreview.textContent = `Total da venda: ${formatCurrency(Math.max(0, total))}`;
}

function syncSaleProductDefaults() {
  const selectedProduct = state.products.find((product) => product.id === saleFields.product.value);

  if (!selectedProduct) {
    return;
  }

  saleFields.unitPrice.value = selectedProduct.salePrice.toFixed(2);
  renderSalePreview();
}

function resetProductForm() {
  productForm.reset();
  productFields.id.value = "";
  productFields.stock.value = 0;
  renderProductMarginPreview();
}

function resetSaleForm() {
  saleForm.reset();
  saleFields.quantity.value = 1;
  saleFields.discount.value = 0;
  saleFields.date.value = new Date().toISOString().slice(0, 10);
  renderProductOptions();
  renderSalePreview();
}

function reseedProducts() {
  state.products = structuredClone(defaultProducts);
  state.sales = [];
  resetProductForm();
  resetSaleForm();
  renderAll();
}

function summarizeSales() {
  const summary = state.sales.reduce(
    (accumulator, sale) => {
      const total = sale.quantity * sale.unitPrice - sale.discount;
      const profit = sale.quantity * (sale.unitPrice - sale.unitCost) - sale.discount;

      accumulator.revenue += total;
      accumulator.profit += profit;
      accumulator.units += sale.quantity;
      accumulator.salesCount += 1;

      const existing = accumulator.rankingMap.get(sale.productId) || {
        name: sale.productName,
        quantity: 0,
        revenue: 0,
        profit: 0,
      };

      existing.quantity += sale.quantity;
      existing.revenue += total;
      existing.profit += profit;
      accumulator.rankingMap.set(sale.productId, existing);

      return accumulator;
    },
    {
      revenue: 0,
      profit: 0,
      units: 0,
      salesCount: 0,
      rankingMap: new Map(),
    }
  );

  return {
    revenue: summary.revenue,
    profit: summary.profit,
    units: summary.units,
    salesCount: summary.salesCount,
    averageTicket: summary.salesCount ? summary.revenue / summary.salesCount : 0,
    ranking: [...summary.rankingMap.values()].sort((left, right) => right.quantity - left.quantity),
  };
}

function getTopChannel() {
  const channelMap = state.sales.reduce((map, sale) => {
    map.set(sale.channel, (map.get(sale.channel) || 0) + 1);
    return map;
  }, new Map());

  const topEntry = [...channelMap.entries()].sort((left, right) => right[1] - left[1])[0];

  if (!topEntry) {
    return null;
  }

  return {
    name: topEntry[0],
    count: topEntry[1],
  };
}

function getMarginPercent(salePrice, costPrice) {
  if (!salePrice || salePrice <= 0) {
    return 0;
  }

  return ((salePrice - costPrice) / salePrice) * 100;
}

function formatCurrency(value) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatDate(value) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T00:00:00`));
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, current) => total + current, 0) / values.length;
}
