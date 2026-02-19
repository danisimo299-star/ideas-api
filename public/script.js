const STORAGE_KEY = "ideamarket_data_v1";

const defaultIdeas = [
  {
    id: crypto.randomUUID(),
    title: "AI-консьерж для ЖК",
    category: "Tech",
    price: 180000,
    description: "Чат-бот для управляющих компаний: заявки, платежи, уведомления жильцам.",
    author: "Команда SmartDom",
    createdAt: Date.now() - 100000,
    owner: "market"
  },
  {
    id: crypto.randomUUID(),
    title: "Даркстор здорового питания",
    category: "Food",
    price: 120000,
    description: "Мини-склад и доставка рационов за 15 минут в бизнес-кварталах.",
    author: "Елена",
    createdAt: Date.now() - 90000,
    owner: "market"
  },
  {
    id: crypto.randomUUID(),
    title: "Маркетплейс микрокурсов",
    category: "Education",
    price: 95000,
    description: "Платформа коротких навыковых курсов с фокусом на трудоустройство.",
    author: "SkillFoundry",
    createdAt: Date.now() - 80000,
    owner: "market"
  }
];

const state = {
  ideas: [],
  cart: []
};

const pageMap = {
  home: document.getElementById("page-home"),
  market: document.getElementById("page-market"),
  sell: document.getElementById("page-sell"),
  my: document.getElementById("page-my")
};

const marketGrid = document.getElementById("marketGrid");
const myIdeasNode = document.getElementById("myIdeas");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const toastNode = document.getElementById("toast");
const ideaCardTemplate = document.getElementById("ideaCardTemplate");

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ideas: state.ideas, cart: state.cart }));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.ideas = [...defaultIdeas];
    state.cart = [];
    saveState();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.ideas = Array.isArray(parsed.ideas) && parsed.ideas.length ? parsed.ideas : [...defaultIdeas];
    state.cart = Array.isArray(parsed.cart) ? parsed.cart : [];
  } catch {
    state.ideas = [...defaultIdeas];
    state.cart = [];
  }
}

function money(value) {
  return `₽${Number(value).toLocaleString("ru-RU")}`;
}

function showToast(message) {
  toastNode.textContent = message;
  toastNode.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toastNode.classList.remove("show"), 1800);
}

function switchPage(route) {
  Object.values(pageMap).forEach((node) => node.classList.remove("active"));
  const next = pageMap[route] || pageMap.home;
  next.classList.add("active");
}

function renderIdeaCard(idea, { showDelete = false } = {}) {
  const fragment = ideaCardTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".idea-card");

  card.querySelector(".badge").textContent = idea.category;
  card.querySelector(".idea-price").textContent = money(idea.price);
  card.querySelector(".idea-title").textContent = idea.title;
  card.querySelector(".idea-description").textContent = idea.description;
  card.querySelector(".idea-meta").textContent = `Автор: ${idea.author}`;

  const buyBtn = card.querySelector(".js-buy");
  buyBtn.addEventListener("click", () => addToCart(idea.id));

  const deleteBtn = card.querySelector(".js-delete");
  if (showDelete) {
    deleteBtn.addEventListener("click", () => deleteIdea(idea.id));
  } else {
    deleteBtn.remove();
  }

  return fragment;
}

function filteredIdeas() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const sort = document.getElementById("sortFilter").value;

  let items = [...state.ideas];

  if (query) {
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query) ||
        i.author.toLowerCase().includes(query)
    );
  }

  if (category !== "all") {
    items = items.filter((i) => i.category === category);
  }

  if (sort === "priceAsc") items.sort((a, b) => a.price - b.price);
  if (sort === "priceDesc") items.sort((a, b) => b.price - a.price);
  if (sort === "newest") items.sort((a, b) => b.createdAt - a.createdAt);

  return items;
}

function renderMarket() {
  marketGrid.innerHTML = "";
  const items = filteredIdeas();

  if (!items.length) {
    marketGrid.innerHTML = `<article class="card"><p>Ничего не найдено. Попробуйте изменить фильтры.</p></article>`;
    return;
  }

  items.forEach((idea) => {
    marketGrid.appendChild(renderIdeaCard(idea));
  });
}

function renderMyIdeas() {
  myIdeasNode.innerHTML = "";
  const mine = state.ideas.filter((i) => i.owner === "me");

  if (!mine.length) {
    myIdeasNode.innerHTML = `<article class="card"><p>Пока нет идей. Разместите первую на вкладке «Разместить идею».</p></article>`;
    return;
  }

  mine.forEach((idea) => myIdeasNode.appendChild(renderIdeaCard(idea, { showDelete: true })));
}

function renderCart() {
  cartList.innerHTML = "";
  let total = 0;

  if (!state.cart.length) {
    cartList.innerHTML = `<li><span class="muted">Корзина пуста</span></li>`;
  }

  state.cart.forEach((id) => {
    const idea = state.ideas.find((i) => i.id === id);
    if (!idea) return;

    total += Number(idea.price);

    const li = document.createElement("li");
    li.innerHTML = `<span>${idea.title}</span><button class="btn btn-secondary btn-small">✕</button>`;
    li.querySelector("button").addEventListener("click", () => removeFromCart(id));
    cartList.appendChild(li);
  });

  cartTotal.textContent = `Итого: ${money(total)}`;
}

function addToCart(id) {
  if (state.cart.includes(id)) {
    showToast("Идея уже добавлена в сделки");
    return;
  }

  state.cart.push(id);
  saveState();
  renderCart();
  showToast("Идея добавлена в сделки");
}

function removeFromCart(id) {
  state.cart = state.cart.filter((item) => item !== id);
  saveState();
  renderCart();
}

function deleteIdea(id) {
  state.ideas = state.ideas.filter((idea) => idea.id !== id);
  state.cart = state.cart.filter((cartId) => cartId !== id);
  saveState();
  renderMarket();
  renderMyIdeas();
  renderCart();
  showToast("Идея удалена");
}

function handleCreateIdea(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const idea = {
    id: crypto.randomUUID(),
    title: String(formData.get("title")).trim(),
    category: String(formData.get("category")),
    price: Number(formData.get("price")),
    description: String(formData.get("description")).trim(),
    author: String(formData.get("author")).trim(),
    createdAt: Date.now(),
    owner: "me"
  };

  state.ideas.push(idea);
  saveState();
  renderMarket();
  renderMyIdeas();
  event.target.reset();
  switchPage("my");
  showToast("Идея опубликована");
}

function checkout() {
  if (!state.cart.length) {
    showToast("Сначала добавьте идеи в сделки");
    return;
  }

  const purchasedCount = state.cart.length;
  state.cart = [];
  saveState();
  renderCart();
  showToast(`Сделка оформлена: ${purchasedCount} шт.`);
}

function registerEvents() {
  document.querySelectorAll("[data-route]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.preventDefault();
      switchPage(node.dataset.route);
    });
  });

  document.getElementById("goSellBtn").addEventListener("click", () => switchPage("sell"));
  document.getElementById("ideaForm").addEventListener("submit", handleCreateIdea);
  document.getElementById("checkoutBtn").addEventListener("click", checkout);

  ["searchInput", "categoryFilter", "sortFilter"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderMarket);
    document.getElementById(id).addEventListener("change", renderMarket);
  });
}

function init() {
  loadState();
  registerEvents();
  renderMarket();
  renderMyIdeas();
  renderCart();
}

init();
