const brand = {
  name: "Doçuras da Lara",
  phone: "77 99982-1270",
  logo: "./catalog_assets/logo-docuras-da-lara.jpeg",
};

const storyProducts = [
  {
    name: "Caixinha com amor",
    price: "R$ 15,00",
    tagline: "Uma lembrança delicada, pensada para presentear com carinho.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.12.jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.14 (2).jpeg",
    ],
    composition: [
      "1 caixinha decorada",
      "1 sacolinha temática",
      "4 biscoitos amanteigados personalizados",
    ],
  },
  {
    name: "Caixa presente de doces finos",
    price: "R$ 60,00",
    tagline: "Uma opção mais sofisticada, com variedade de doces e apresentação especial.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.16.jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.16 (2).jpeg",
    ],
    composition: [
      "1 caixa retangular com dois andares",
      "1 coração lapidado escrito MÃE",
      "12 doces variados no corpo da caixa",
      "1 sacola temática",
    ],
  },
  {
    name: "Caixa coração com brigadeiros",
    price: "R$ 20,00",
    tagline: "Um mimo romântico e delicado para presentear de forma especial.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.17 (3).jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.17 (2).jpeg",
    ],
    composition: [
      "1 caixa em formato de coração",
      "4 brigadeiros ou bombons decorados",
      "1 sacola temática",
    ],
  },
  {
    name: "Rosa com mensagem Mãe",
    price: "R$ 25,00",
    tagline: "Uma lembrança criativa, delicada e cheia de significado.",
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
    tagline: "Uma combinação delicada com doces decorados e apresentação pronta para presentear.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.28.jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.28 (1).jpeg",
    ],
    composition: [
      "1 mini bolo no acetato",
      "Topper Feliz Dia das Mães",
      "6 doces no mix lateral",
      "Caixa transparente com laço",
      "1 sacola temática",
    ],
  },
  {
    name: "Kit bolo no acetato e brigadeiros",
    price: "R$ 50,00",
    tagline: "Uma opção compacta e charmosa para surpreender com carinho.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.22.jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.23 (1).jpeg",
    ],
    composition: [
      "1 bolo no acetato com topper",
      "1 caixinha com 4 brigadeiros",
      "1 sacola temática com visor de coração",
    ],
  },
  {
    name: "Cesta Mãe com balões",
    price: "R$ 80,00",
    tagline: "Uma proposta de maior impacto, com toque personalizado e presença marcante.",
    photos: [
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.24.jpeg",
      "./catalog_assets/WhatsApp Image 2026-04-27 at 13.57.25 (1).jpeg",
    ],
    composition: [
      "Base em MDF",
      "Balões de decoração",
      "1 mini bolo no acetato com laço",
      "6 doces artesanais",
      "Foto personalizada",
    ],
  },
  {
    name: "Mini bolo com rosa",
    price: "R$ 60,00",
    tagline: "Uma escolha delicada e marcante para emocionar já no primeiro olhar.",
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
