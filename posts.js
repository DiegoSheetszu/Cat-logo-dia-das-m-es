const brand = {
  name: "Doçuras da Lara",
  phone: "77 99982-1270",
  logo: "./catalog_assets/logo-docuras-da-lara.jpeg",
};

const storyProducts = [
  {
    name: "Caixinha com amor",
    price: "R$ 15,00",
    tagline: "Mimo delicado com a sacolinha e os biscoitos em destaque.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.12.jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.14 (2).jpeg",
    ],
    composition: [
      "1 caixinha vinho decorada",
      "1 sacolinha temática",
      "4 biscoitos amanteigados",
      "Coração com recheio aparente",
    ],
  },
  {
    name: "Caixa presente de doces finos",
    price: "R$ 60,00",
    tagline: "Versão premium com variedade de doces e caixa rígida.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.16.jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.16 (2).jpeg",
    ],
    composition: [
      "1 caixa retangular rígida",
      "1 peça branca escrita MÃE",
      "10 doces variados no corpo da caixa",
      "1 sacola especial combinando",
    ],
  },
  {
    name: "Caixa coração com brigadeiros",
    price: "R$ 20,00",
    tagline: "Pequena, romântica e pronta para presentear.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.17 (3).jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.17 (2).jpeg",
    ],
    composition: [
      "1 caixa em formato de coração",
      "4 brigadeiros ou bombons decorados",
      "Detalhes vermelhos e dourados",
      "Apresentação pronta para presente",
    ],
  },
  {
    name: "Rosa com mensagem Mãe",
    price: "R$ 25,00",
    tagline: "Caixa longa com rosa natural e doces formando a palavra MÃE.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.20.jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.21 (1).jpeg",
    ],
    composition: [
      "1 rosa natural vermelha",
      "4 doces alinhados na caixa",
      "Letras douradas formando MÃE",
      "Embalagem longa com visor frontal",
    ],
  },
  {
    name: "Kit mini bolo e brigadeiros",
    price: "R$ 60,00",
    tagline: "Kit com mini bolo no acetato e mix de doces na caixa transparente.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.28.jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.28 (1).jpeg",
    ],
    composition: [
      "1 mini bolo no acetato",
      "Topper Feliz Dia das Mães",
      "6 doces no mix lateral",
      "Caixa transparente com laço",
    ],
  },
  {
    name: "Kit bolo no acetato e brigadeiros",
    price: "R$ 50,00",
    tagline: "Bolo no acetato com brigadeiros e sacola temática em um presente delicado.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.22.jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.23 (1).jpeg",
    ],
    composition: [
      "1 bolo no acetato com topper",
      "1 caixinha com 4 brigadeiros",
      "1 sacola temática com coração",
    ],
  },
  {
    name: "Cesta Mãe com balões",
    price: "R$ 80,00",
    tagline: "Peça premium com base decorada, balões e foto personalizada.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.24.jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.25 (1).jpeg",
    ],
    composition: [
      "Base em MDF escrita Te Mãe",
      "3 balões: 2 vermelhos e 1 dourado",
      "1 mini bolo no acetato com laço",
      "5 doces aparentes e foto personalizada",
    ],
  },
  {
    name: "Mini bolo com rosa",
    price: "R$ 60,00",
    tagline: "Mini bolo redondo com rosa natural e doces ao redor da base.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.29.jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.29 (1).jpeg",
    ],
    composition: [
      "1 mini bolo redondo decorado",
      "Topo com rosa natural vermelha",
      "Letras douradas MÃE na lateral",
      "6 doces ao redor da base",
    ],
  },
];

const storiesGrid = document.querySelector("#storiesGrid");

storiesGrid.innerHTML = "";

storyProducts.forEach((product, index) => {
  const card = document.createElement("article");
  card.className = "story-card";
  card.style.setProperty("--story-delay", `${index * 70}ms`);

  const compositionItems = product.composition
    .map((item) => `<li>${item}</li>`)
    .join("");

  const [primaryPhoto, secondaryPhoto] = product.photos;

  card.innerHTML = `
    <div class="story-shell">
      <div class="story-brand">
        <div class="story-logo-wrap">
          <img
            class="story-logo"
            src="${brand.logo}"
            alt="Logo ${brand.name}"
          />
        </div>
        <div class="story-brand-copy">
          <p class="story-kicker">Dia das Mães</p>
          <p class="story-brand-name">${brand.name}</p>
        </div>
        <div class="story-price">${product.price}</div>
      </div>

      <div class="story-copy">
        <p class="story-label">Catálogo especial</p>
        <h2 class="story-title">${product.name}</h2>
        <p class="story-tagline">${product.tagline}</p>
      </div>

      <div class="story-media">
        <figure class="story-photo story-photo-primary">
          <img src="${primaryPhoto}" alt="${product.name}" loading="lazy" />
        </figure>
        <figure class="story-photo story-photo-secondary">
          <img src="${secondaryPhoto}" alt="Detalhe de ${product.name}" loading="lazy" />
        </figure>
      </div>

      <div class="story-details">
        <h3>Itens do kit</h3>
        <ul class="story-list">
          ${compositionItems}
        </ul>
      </div>
    </div>
  `;

  storiesGrid.appendChild(card);
});
