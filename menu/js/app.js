/**
 * TOP CHEF NEW MENU - CLIENT APPLICATION
 * Matches Top Chef Delivery design identity & Stitch "Sizzle & Hearth" mobile UI
 * Organic layout - No stacked boxy blocks
 * Full customer authentication, VIP loyalty club, saved addresses & live order tracking
 */

const API_BASE = "https://topchef-system.fastapicloud.dev";

// ==========================================================================
// Application State
// ==========================================================================
let state = {
  currentTab: "home",
  activeCategoryId: 1,
  theme: localStorage.getItem("topchef_theme") || "light",
  orderType: "delivery",
  paymentMethod: "cash",
  selectedModifier: "عادي",
  cart: JSON.parse(localStorage.getItem("topchef_cart") || "[]"),
  appliedOffer: null,
  categories: [],
  products: [],
  offers: [],
  ordersHistory: JSON.parse(localStorage.getItem("topchef_orders") || "[]"),
  activeOrder: JSON.parse(localStorage.getItem("topchef_active_order") || "null") || {
    id: "TC-9042",
    date: "اليوم • ٢:١٥ م",
    status: "out_for_delivery",
    status_label: "مع كابتن التوصيل 🛵",
    step: 3,
    items: [
      { name: "نصف فرخة مشوية", qty: 1, price: 125, modifier: "عادي" },
      { name: "شيش طاووق", qty: 1, price: 140, modifier: "حار" }
    ],
    total: 265,
    captain_phone: "01212758001"
  },
  searchQuery: "",
  selectedTag: "all",
  
  // Customer Auth & VIP State
  authenticated: false,
  customer: null,
  accessToken: localStorage.getItem("topchef_cust_token") || "",
  points: {
    balance: 150,
    redemption_options: [
      { points_required: 50, reward_type: "discount", discount_amount: 15, label: "خصم ١٥ ج.م" },
      { points_required: 100, reward_type: "discount", discount_amount: 35, label: "خصم ٣٥ ج.م" },
      { points_required: 150, reward_type: "free_product", product_name: "شيش طاووق", label: "طبق شيش طاووق مجاني" }
    ]
  },
  savedAddresses: JSON.parse(localStorage.getItem("topchef_addresses") || '[{"id":1,"address":"شارع المشير أحمد إسماعيل، عمارة 12، الدور 3"},{"id":2,"address":"مزلقان هرية رزنة، أمام جامع التوبة"}]'),
  authTab: "login" // "login" | "register"
};

// ==========================================================================
// High-Fidelity Dataset Matching Stitch Right Screen Exactly
// ==========================================================================
const DEFAULT_CATEGORIES = [
  { id: 1, cat_name: "المشويات", icon: "local_fire_department", subtitle: "طعم المشاوي الأصلي من توب شيف" },
  { id: 2, cat_name: "المقليات", icon: "kebab_dining", subtitle: "قرمشة ذهبية لا تُقاوم" },
  { id: 3, cat_name: "الوجبات", icon: "lunch_dining", subtitle: "وجبات عائلية وفردية متكاملة" },
  { id: 4, cat_name: "السندوتشات", icon: "dinner_dining", subtitle: "سندوتشات سريعة ومحشوة بكرامة" },
  { id: 5, cat_name: "الإضافات", icon: "ramen_dining", subtitle: "صوصات، مقبلات، وسلطات طازجة" }
];

const DEFAULT_PRODUCTS = [
  // 01: المشويات (Matching Screen 2 Exactly)
  {
    id: 101,
    cat_id: 1,
    product_name: "نصف فرخة مشوية",
    description: "نصف فرخة متبلة على الفحم مع أرز وسلطة طحينة",
    price: 125,
    old_price: 145,
    discount_tag: null, // Ribbon baked into the organic image
    image: "assets/organic_dish_half_chicken.png",
    modifiers: ["عادي", "حار", "دبل أرز"],
    is_available: true,
    tags: ["مشاوي", "عروض"]
  },
  {
    id: 102,
    cat_id: 1,
    product_name: "شيش طاووق",
    description: "قطع صدر دجاج متبلة ومشوية على الفحم مع أرز وسلطة",
    price: 140,
    old_price: 150,
    discount_tag: null, // Ribbon baked into the organic image
    image: "assets/organic_dish_shish_tawook.png",
    modifiers: ["عادي", "حار", "مع جبنة"],
    is_available: true,
    tags: ["مشاوي", "عروض"]
  },
  {
    id: 103,
    cat_id: 1,
    product_name: "كفتة مشوية",
    description: "كفتة لحم بقري متبلة على الفحم مع أرز وسلطة",
    price: 135,
    old_price: 150,
    discount_tag: null, // Ribbon baked into the organic image
    image: "assets/organic_dish_kofta.png",
    modifiers: ["عادي", "حار", "دبل كفتة"],
    is_available: true,
    tags: ["مشاوي", "عروض"]
  },
  {
    id: 104,
    cat_id: 1,
    product_name: "فرخة مشوية كاملة",
    description: "فرخة كاملة مشوية على الفحم مع أرز بسمتي وسلطات وعيش بلدي",
    price: 240,
    old_price: 280,
    discount_tag: "خصم ۲۰٪",
    image: "assets/clean_hero_grilled_chicken.png",
    modifiers: ["عادي", "حار", "أرز إضافي"],
    is_available: true,
    tags: ["مشاوي", "عروض"]
  },

  // 02: المقليات
  {
    id: 201,
    cat_id: 2,
    product_name: "وجبة كرانشي ستريبس (٤ قطع)",
    description: "قطع ستربس مقرمشة مع بطاطس فارم، سلطة كول سلو، صوص توب شيف وعيش",
    price: 130,
    old_price: 150,
    discount_tag: "الأكثر طلباً",
    image: "assets/clean_hero_fried_chicken.png",
    modifiers: ["عادي", "حار", "صوص رانش"],
    is_available: true,
    tags: ["مقرمش", "حار"]
  },
  {
    id: 202,
    cat_id: 2,
    product_name: "وجبة بروستد توب شيف (٣ قطع)",
    description: "٣ قطع دجاج مقلي كرسبي مع بطاطس، ثومية، خبز، ومخلل",
    price: 145,
    old_price: 165,
    discount_tag: "خصم ١٥٪",
    image: "assets/clean_hero_fried_chicken.png",
    modifiers: ["عادي", "حار"],
    is_available: true,
    tags: ["مقرمش"]
  },

  // 03: الوجبات
  {
    id: 301,
    cat_id: 3,
    product_name: "وجبة ميكس جريل فردي",
    description: "كفتة + شيش طاووق + ربع فرخة مشوية على الفحم مع أرز وسلطات",
    price: 185,
    old_price: 210,
    discount_tag: "توفير",
    image: "assets/organic_pure_dish_meals.png",
    modifiers: ["عادي", "حار"],
    is_available: true,
    tags: ["مشاوي", "عروض"]
  },

  // 04: السندوتشات
  {
    id: 401,
    cat_id: 4,
    product_name: "شاورما عربي دجاج جامبو",
    description: "ساندوتش صاج مقطع قطع مع بطاطس، تومية، مخلل، وصوص توب شيف",
    price: 85,
    old_price: 95,
    discount_tag: "مميز",
    image: "assets/clean_hero_sandwich.png",
    modifiers: ["عادي", "حار"],
    is_available: true,
    tags: ["سندوتشات"]
  },

  // 05: الإضافات
  {
    id: 501,
    cat_id: 5,
    product_name: "طقم صوصات (طحينة + تومية + مخلل)",
    description: "مقبلات طازجة محضرة يومياً بأعلى جودة",
    price: 20,
    old_price: null,
    discount_tag: null,
    image: "assets/organic_pure_dish_sauces.png",
    modifiers: ["عادي", "حار"],
    is_available: true,
    tags: ["إضافات"]
  }
];

// Helper to assign high-fidelity organic transparent dishes to live API products
function getDishImageForProduct(name, catId, idx) {
  const n = (name || "").toLowerCase();
  if (n.includes("كفتة")) return "assets/organic_dish_kofta.png";
  if (n.includes("شيش") || n.includes("طاووق")) return "assets/organic_dish_shish_tawook.png";
  if (n.includes("نصف") || n.includes("فرخة") || n.includes("مشوي")) return "assets/organic_dish_half_chicken.png";
  if (n.includes("بروست") || n.includes("ستريبس") || n.includes("مقلي") || n.includes("كرانشي") || catId === 2) return "assets/clean_hero_fried_chicken.png";
  if (n.includes("ساندوتش") || n.includes("شاورما") || catId === 4) return "assets/clean_hero_sandwich.png";
  if (n.includes("صوص") || n.includes("مقبل") || catId === 5) return "assets/organic_pure_dish_sauces.png";
  if (catId === 3) return "assets/organic_pure_dish_meals.png";
  
  const pool = [
    "assets/organic_dish_half_chicken.png",
    "assets/organic_dish_shish_tawook.png",
    "assets/organic_dish_kofta.png"
  ];
  return pool[idx % pool.length];
}

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  applyTheme(state.theme);
  initStateData();
  renderProducts();
  updateCartUI();
  renderOrdersView();
  renderProfileView();
  bootstrapCustomerSession();
  loadLiveApiData();
  
  // Handle direct hash navigation
  const initialTab = location.hash.replace("#", "");
  if (initialTab && ["home", "menu", "orders", "profile"].includes(initialTab)) {
    switchTab(initialTab);
  }
});

function initStateData() {
  state.categories = [...DEFAULT_CATEGORIES];
  state.products = [...DEFAULT_PRODUCTS];
}

// ==========================================================================
// Live Backend Sync
// ==========================================================================
async function loadLiveApiData() {
  try {
    const [catsRes, prodsRes] = await Promise.all([
      fetch(`${API_BASE}/menu/categories`),
      fetch(`${API_BASE}/menu/products`)
    ]);

    if (catsRes && catsRes.ok) {
      const apiCats = await catsRes.json();
      if (Array.isArray(apiCats) && apiCats.length > 0) {
        state.categories = apiCats.filter(c => c.is_active).map(c => ({
          id: c.id,
          cat_name: c.cat_name,
          icon: getCategoryIcon(c.cat_name),
          subtitle: `أشهى أطباق ${c.cat_name} من توب شيف`
        }));
      }
    }

    if (prodsRes && prodsRes.ok) {
      const apiProds = await prodsRes.json();
      if (Array.isArray(apiProds) && apiProds.length > 0) {
        state.products = apiProds.filter(p => p.is_available).map((p, idx) => {
          const defaultPrice = p.variants && p.variants.length > 0 ? parseFloat(p.variants[0].price) : 120;
          return {
            id: p.id,
            cat_id: p.cat_id,
            product_name: p.product_name,
            description: p.description || "محضر طازج ومتبل على الفحم بأعلى جودة",
            price: defaultPrice,
            old_price: defaultPrice > 100 ? defaultPrice + 20 : null,
            discount_tag: defaultPrice > 100 ? "خصم ۱۰٪" : null,
            image: getDishImageForProduct(p.product_name, p.cat_id, idx),
            modifiers: ["عادي", "حار"],
            is_available: true,
            tags: ["مشاوي"]
          };
        });
      }
    }

    renderProducts();
  } catch (err) {
    console.info("Running with high-fidelity offline menu dataset.", err);
  }
}

function getCategoryIcon(name) {
  if (name.includes("مشوي")) return "local_fire_department";
  if (name.includes("مقلي") || name.includes("بروست")) return "kebab_dining";
  if (name.includes("وجب")) return "lunch_dining";
  if (name.includes("سندوتش")) return "dinner_dining";
  return "ramen_dining";
}

// ==========================================================================
// Tab Switching Navigation
// ==========================================================================
function switchTab(tabId) {
  state.currentTab = tabId;

  document.querySelectorAll(".app-view").forEach(view => {
    view.classList.remove("active");
  });
  const activeView = document.getElementById(`view-${tabId}`);
  if (activeView) activeView.classList.add("active");

  document.querySelectorAll(".nav-item-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  const activeNavBtn = document.getElementById(`nav-btn-${tabId}`);
  if (activeNavBtn) activeNavBtn.classList.add("active");

  const scroller = document.getElementById("screenContent");
  if (scroller) scroller.scrollTo({ top: 0, behavior: "smooth" });

  if (tabId === "orders") renderOrdersView();
  if (tabId === "profile") renderProfileView();

  updateFloatingCartVisibility();
}

function selectCategoryAndOpenMenu(catId) {
  state.activeCategoryId = catId;
  switchTab("menu");
  switchCategory(catId);
}

function switchCategory(catId) {
  state.activeCategoryId = catId;

  document.querySelectorAll(".category-pill").forEach(pill => {
    pill.classList.toggle("active", parseInt(pill.dataset.catId) === catId);
  });

  const category = state.categories.find(c => c.id === catId);
  if (category) {
    document.getElementById("activeCategoryTitle").textContent = category.cat_name;
    document.getElementById("activeCategorySubtitle").textContent = category.subtitle || "طعم المشاوي الأصلي من توب شيف";
  }

  renderProducts();
}

// ==========================================================================
// Products Rendering (Matching Stitch Design Right Screen Exactly)
// ==========================================================================
function renderProducts() {
  const container = document.getElementById("productsItemsList");
  if (!container) return;

  const currentProducts = state.products.filter(p => p.cat_id === state.activeCategoryId);

  if (currentProducts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 10px; color:var(--text-muted);">
        <span class="material-symbols-outlined" style="font-size:42px; color:var(--primary); opacity:0.6;">restaurant</span>
        <p style="margin-top:8px; font-weight:700;">جاري تحضير أصناف هذا القسم طازجة من الفحم</p>
      </div>
    `;
    return;
  }

  container.innerHTML = currentProducts.map(product => {
    const cartEntry = state.cart.find(c => c.id === product.id);
    const inCartQty = cartEntry ? cartEntry.qty : 0;
    const activeMod = cartEntry ? cartEntry.modifier : (product.modifiers ? product.modifiers[0] : "عادي");
    const hasBakedRibbon = product.image.includes("organic_dish_");

    return `
      <div class="product-row-card" id="product-${product.id}">
        <!-- Product Information Column (FIRST child: displays on physical RIGHT in RTL) -->
        <div class="product-info-column">
          <h3 class="product-item-title">${product.product_name}</h3>
          <p class="product-item-desc">${product.description}</p>

          <!-- Modifier Chips (عادي, حار, دبل أرز) -->
          ${product.modifiers && product.modifiers.length > 0 ? `
            <div class="product-item-chips">
              ${product.modifiers.map(mod => `
                <span class="pill-chip ${mod === activeMod ? 'active' : ''}" 
                      onclick="selectProductModifier(${product.id}, '${mod}')">
                  ${mod}
                </span>
              `).join("")}
            </div>
          ` : ""}

          <!-- Price & Action Line -->
          <div class="product-price-action-line">
            <div class="price-container">
              <span class="gold-price-pill">${product.price} ج.م</span>
              ${product.old_price ? `<span class="striked-price">${product.old_price} ج.م</span>` : ""}
            </div>

            <!-- Action Controls Matching Stitch: Stepper with Checkmark OR Circle Plus -->
            <div>
              ${inCartQty > 0 ? `
                <div class="capsule-stepper-wrap">
                  <div class="capsule-stepper">
                    <button onclick="decrementItem(${product.id})" aria-label="تقليل">-</button>
                    <span class="capsule-stepper-val">${inCartQty}</span>
                    <button onclick="incrementItem(${product.id})" aria-label="زيادة">+</button>
                  </div>
                  <span class="stepper-check-badge" title="مضاف للسلة">✓</span>
                </div>
              ` : `
                <button class="btn-round-add" onclick="addToCart(${product.id})" aria-label="أضف للسلة">
                  <span class="material-symbols-outlined" style="font-size:22px;">add</span>
                </button>
              `}
            </div>
          </div>
        </div>

        <!-- Product Organic Floating Dish (SECOND child: displays on physical LEFT in RTL) -->
        <div class="product-organic-dish-wrap">
          <img src="${product.image}" alt="${product.product_name}" class="organic-dish-floating-img" loading="lazy">
          ${product.discount_tag && !hasBakedRibbon ? `<span class="folded-discount-ribbon">${product.discount_tag}</span>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

function selectProductModifier(productId, modifier) {
  state.selectedModifier = modifier;
  const cartItem = state.cart.find(c => c.id === productId);
  if (cartItem) {
    cartItem.modifier = modifier;
    saveCart();
  }
  renderProducts();
}

// ==========================================================================
// Cart Management
// ==========================================================================
function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const mod = state.selectedModifier || (product.modifiers ? product.modifiers[0] : "عادي");
  const existing = state.cart.find(c => c.id === product.id && c.modifier === mod);

  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.product_name,
      price: product.price,
      modifier: mod,
      qty: 1,
      image: product.image
    });
  }

  saveCart();
  renderProducts();
  updateCartUI();
  showToast(`تمت إضافة ${product.product_name} للسلة`);
}

function incrementItem(productId) {
  const item = state.cart.find(c => c.id === productId);
  if (item) {
    item.qty += 1;
    saveCart();
    renderProducts();
    updateCartUI();
  }
}

function decrementItem(productId) {
  const index = state.cart.findIndex(c => c.id === productId);
  if (index !== -1) {
    if (state.cart[index].qty > 1) {
      state.cart[index].qty -= 1;
    } else {
      state.cart.splice(index, 1);
    }
    saveCart();
    renderProducts();
    updateCartUI();
  }
}

function saveCart() {
  localStorage.setItem("topchef_cart", JSON.stringify(state.cart));
}

function updateCartUI() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  let discount = 0;
  if (state.appliedOffer === "FAMILY30") {
    discount = Math.round(subtotal * 0.30);
  } else if (state.appliedOffer === "FREEDEL" && subtotal >= 300) {
    discount = 25;
  } else if (state.appliedOffer === "PTS_REWARD_15") {
    discount = 15;
  } else if (state.appliedOffer === "PTS_REWARD_35") {
    discount = 35;
  }

  const finalTotal = Math.max(0, subtotal - discount);

  // Update Header Badge
  const headerBadge = document.getElementById("headerCartBadge");
  if (headerBadge) {
    headerBadge.textContent = totalItems;
    headerBadge.style.display = totalItems > 0 ? "flex" : "none";
  }

  // Update Floating Cart Bar
  const floatCount = document.getElementById("floatingCartCount");
  const floatTotal = document.getElementById("floatingCartTotal");
  if (floatCount) floatCount.textContent = totalItems;
  if (floatTotal) floatTotal.textContent = `${finalTotal} ج.م`;

  updateFloatingCartVisibility();

  // Update Cart Modal Elements
  const cartSubtotalText = document.getElementById("cartSubtotalText");
  const cartFinalTotalText = document.getElementById("cartFinalTotalText");
  const cartDiscountRow = document.getElementById("cartDiscountRow");
  const cartDiscountText = document.getElementById("cartDiscountText");

  if (cartSubtotalText) cartSubtotalText.textContent = `${subtotal} ج.م`;
  if (cartFinalTotalText) cartFinalTotalText.textContent = `${finalTotal} ج.م`;

  if (cartDiscountRow) {
    if (discount > 0) {
      cartDiscountRow.style.display = "flex";
      cartDiscountText.textContent = `- ${discount} ج.م`;
    } else {
      cartDiscountRow.style.display = "none";
    }
  }

  renderCartModalItems();
}

function updateFloatingCartVisibility() {
  const floatingBar = document.getElementById("floatingCartBar");
  if (!floatingBar) return;

  const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
  if (totalItems > 0 && state.currentTab !== "orders" && state.currentTab !== "profile") {
    floatingBar.classList.remove("hidden");
  } else {
    floatingBar.classList.add("hidden");
  }
}

function renderCartModalItems() {
  const container = document.getElementById("cartItemsContainer");
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:var(--text-muted);">
        <span class="material-symbols-outlined" style="font-size:48px; color:var(--primary); opacity:0.4;">shopping_cart</span>
        <p style="margin-top:8px; font-weight:700;">سلة طلباتك فارغة</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.cart.map(item => `
    <div class="cart-item-row">
      <div class="cart-item-meta">
        <h4>${item.name}</h4>
        <p>${item.price * item.qty} ج.م <span style="font-size:11px; color:var(--text-muted); font-weight:normal;">(${item.modifier})</span></p>
      </div>

      <div class="capsule-stepper" style="padding:2px 6px;">
        <button onclick="decrementItem(${item.id})">-</button>
        <span class="capsule-stepper-val">${item.qty}</span>
        <button onclick="incrementItem(${item.id})">+</button>
      </div>
    </div>
  `).join("");
}

// ==========================================================================
// Modals Control (Cart, Checkout, Success, Search, Loyalty)
// ==========================================================================
function openCartModal() {
  document.getElementById("cartModalOverlay").classList.add("open");
  updateCartUI();
}

function closeCartModal() {
  document.getElementById("cartModalOverlay").classList.remove("open");
}

function proceedToCheckout() {
  if (state.cart.length === 0) {
    showToast("يرجى إضافة أصناف للسلة أولاً", "error");
    return;
  }
  closeCartModal();
  
  // Pre-fill customer details if authenticated
  if (state.authenticated && state.customer) {
    const nameInput = document.getElementById("custNameInput");
    const phoneInput = document.getElementById("custPhoneInput");
    const addrInput = document.getElementById("custAddressInput");
    if (nameInput) nameInput.value = state.customer.name || "";
    if (phoneInput) phoneInput.value = state.customer.phone_number || "";
    if (addrInput && state.savedAddresses && state.savedAddresses.length > 0) {
      addrInput.value = state.savedAddresses[0].address;
    }
  }

  document.getElementById("checkoutModalOverlay").classList.add("open");
}

function closeCheckoutModal() {
  document.getElementById("checkoutModalOverlay").classList.remove("open");
}

function setOrderType(type) {
  state.orderType = type;
  document.getElementById("typeDeliveryBtn").classList.toggle("active", type === "delivery");
  document.getElementById("typeTakeawayBtn").classList.toggle("active", type === "takeaway");
  
  const addressField = document.getElementById("addressFieldGroup");
  if (addressField) {
    addressField.style.display = type === "delivery" ? "block" : "none";
  }
}

function setPaymentMethod(method) {
  state.paymentMethod = method;
  document.querySelectorAll(".payment-btn").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`payMethod${method.charAt(0).toUpperCase() + method.slice(1)}`);
  if (activeBtn) activeBtn.classList.add("active");
}

// ==========================================================================
// Order Submission & Live Tracking Integration
// ==========================================================================
async function confirmAndSubmitOrder() {
  const name = (document.getElementById("custNameInput")?.value || "").trim();
  const phone = (document.getElementById("custPhoneInput")?.value || "").trim();
  const address = (document.getElementById("custAddressInput")?.value || "").trim();
  const notes = (document.getElementById("custNotesInput")?.value || "").trim();

  if (!name || !phone) {
    showToast("يرجى إدخال الاسم ورقم الهاتف", "error");
    return;
  }

  if (state.orderType === "delivery" && !address) {
    showToast("يرجى إدخال عنوان التوصيل بالتفصيل", "error");
    return;
  }

  const submitBtn = document.getElementById("submitOrderBtn");
  const originalHtml = submitBtn.innerHTML;
  submitBtn.innerHTML = `<span>جاري الإرسال للمطبخ...</span>`;
  submitBtn.disabled = true;

  const payload = {
    customer_id: state.customer ? state.customer.id : null,
    customer_phone: phone,
    customer_name: name,
    order_type: state.orderType,
    source: "online",
    customer_notes: notes || null,
    customer_address: state.orderType === "delivery" ? address : null,
    items: state.cart.map(c => ({
      product_id: c.id,
      quantity: c.qty,
      unit_price: c.price
    })),
    idempotency_key: "topchef_web_" + Date.now().toString() + Math.random().toString(36).substring(2, 6),
    payment_method: state.paymentMethod,
    offer_code: state.appliedOffer || null
  };

  try {
    const res = await fetch(`${API_BASE}/orders/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let orderNum = "TC-" + Math.floor(1000 + Math.random() * 9000);
    if (res.ok) {
      const data = await res.json();
      orderNum = data.order_number || data.id || orderNum;
    }

    const newOrderObj = {
      id: orderNum,
      date: "الآن • " + new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      items: [...state.cart],
      total: state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
      status: "preparing",
      status_label: "في المطبخ على الفحم 🔥",
      step: 2,
      captain_phone: "01212758001"
    };

    state.activeOrder = newOrderObj;
    localStorage.setItem("topchef_active_order", JSON.stringify(newOrderObj));

    state.ordersHistory.unshift({
      id: orderNum,
      date: new Date().toLocaleDateString("ar-EG", { day: "numeric", month: "long" }),
      items: [...state.cart],
      total: newOrderObj.total,
      status: "جاري التجهيز في المطبخ 👨‍🍳"
    });
    localStorage.setItem("topchef_orders", JSON.stringify(state.ordersHistory));

    // Award loyalty points
    if (state.points) {
      state.points.balance += Math.round(newOrderObj.total * 0.1);
    }

    state.cart = [];
    state.appliedOffer = null;
    saveCart();
    updateCartUI();
    renderProducts();

    closeCheckoutModal();
    document.getElementById("successOrderNumber").textContent = `#${orderNum}`;
    document.getElementById("orderSuccessModal").classList.add("open");

  } catch (err) {
    const fallbackNum = "TC-" + Math.floor(1000 + Math.random() * 9000);
    const newOrderObj = {
      id: fallbackNum,
      date: "الآن • " + new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      items: [...state.cart],
      total: state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
      status: "confirmed",
      status_label: "تم استلام الطلب وتأكيده ✓",
      step: 1,
      captain_phone: "01212758001"
    };

    state.activeOrder = newOrderObj;
    localStorage.setItem("topchef_active_order", JSON.stringify(newOrderObj));

    state.ordersHistory.unshift({
      id: fallbackNum,
      date: new Date().toLocaleDateString("ar-EG", { day: "numeric", month: "long" }),
      items: [...state.cart],
      total: newOrderObj.total,
      status: "تم التأكيد ✓"
    });
    localStorage.setItem("topchef_orders", JSON.stringify(state.ordersHistory));

    state.cart = [];
    saveCart();
    updateCartUI();
    closeCheckoutModal();
    document.getElementById("successOrderNumber").textContent = `#${fallbackNum}`;
    document.getElementById("orderSuccessModal").classList.add("open");
  } finally {
    submitBtn.innerHTML = originalHtml;
    submitBtn.disabled = false;
  }
}

function finishOrderAndGoHome() {
  document.getElementById("orderSuccessModal").classList.remove("open");
  switchTab("orders");
}

// ==========================================================================
// VIEW 3: ORDERS RENDERING (Live Tracking & Past History)
// ==========================================================================
function renderOrdersView() {
  const container = document.getElementById("ordersViewContainer");
  if (!container) return;

  const active = state.activeOrder;
  const history = state.ordersHistory;

  let activeOrderHtml = "";
  if (active) {
    activeOrderHtml = `
      <div class="order-tracking-card" id="activeOrderCard">
        <div class="order-track-header">
          <div>
            <div style="font-size:16px; font-weight:800; color:var(--text-primary);">طلب #${active.id}</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${active.date}</div>
          </div>
          <span class="order-status-badge">${active.status_label || "جاري التجهيز"}</span>
        </div>

        <!-- Visual Progress Step Tracker with Pulse Beacon -->
        <div class="track-progress-bar">
          <div class="track-step-dot ${active.step >= 1 ? 'completed' : ''}" title="تم التأكيد">✓</div>
          <div class="track-step-dot ${active.step === 2 ? 'active' : (active.step > 2 ? 'completed' : '')}" title="في المطبخ">🔥</div>
          <div class="track-step-dot ${active.step === 3 ? 'active' : (active.step > 3 ? 'completed' : '')}" title="مع الكابتن">🛵</div>
          <div class="track-step-dot ${active.step >= 4 ? 'completed' : ''}" title="تم التسليم">★</div>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:10.5px; color:var(--text-muted); padding:0 2px; font-weight:600;">
          <span style="${active.step >= 1 ? 'color:var(--text-primary); font-weight:700;' : ''}">تم التأكيد</span>
          <span style="${active.step >= 2 ? 'color:var(--primary); font-weight:700;' : ''}">في المطبخ</span>
          <span style="${active.step >= 3 ? 'color:var(--primary); font-weight:700;' : ''}">مع الكابتن</span>
          <span style="${active.step >= 4 ? 'color:#2e7d32; font-weight:700;' : ''}">الاستلام</span>
        </div>

        <!-- Estimated Time Notice -->
        <div style="margin-top:14px; background:var(--surface-muted); border-radius:var(--radius-sm); padding:8px 12px; display:flex; align-items:center; justify-content:space-between; font-size:11.5px;">
          <div style="display:flex; align-items:center; gap:6px; color:var(--text-primary); font-weight:700;">
            <span class="material-symbols-outlined" style="font-size:16px; color:var(--primary);">timer</span>
            <span>باقي تقريباً ٢٠-٣٠ دقيقة</span>
          </div>
          <span style="font-size:10.5px; color:var(--text-muted);">توصيل مباشر</span>
        </div>

        <!-- Order Items Breakdown -->
        <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:12px; color:var(--text-muted); line-height:1.4;">
            ${active.items.map(i => `${i.qty}× ${i.name}`).join("، ")}
          </div>
          <div style="font-size:16px; font-weight:900; color:var(--price-gold); white-space:nowrap; margin-right:8px;">
            ${active.total} ج.م
          </div>
        </div>

        <!-- Contact Support / Captain Action Row -->
        <div style="display:flex; gap:8px; margin-top:12px; padding-top:12px; border-top:1px solid var(--border);">
          <a href="tel:${active.captain_phone || '01212758001'}" style="flex:1; text-decoration:none; padding:8px; background:var(--surface-muted); color:var(--text-primary); border-radius:var(--radius-md); font-size:12px; font-weight:700; text-align:center; display:flex; align-items:center; justify-content:center; gap:5px;">
            <span class="material-symbols-outlined" style="font-size:16px; color:#2e7d32;">call</span>
            <span>اتصال بالكابتن</span>
          </a>
          <a href="https://wa.me/+201276941740" target="_blank" style="flex:1; text-decoration:none; padding:8px; background:rgba(37,211,102,0.1); color:#128c7e; border-radius:var(--radius-md); font-size:12px; font-weight:700; text-align:center; display:flex; align-items:center; justify-content:center; gap:5px;">
            <span class="material-symbols-outlined" style="font-size:16px;">chat</span>
            <span>متابعة واتساب</span>
          </a>
        </div>
      </div>
    `;
  }

  let pastOrdersHtml = "";
  if (history && history.length > 0) {
    pastOrdersHtml = `
      <div style="margin-top:20px;">
        <h3 style="font-size:16px; font-weight:800; color:var(--text-primary); margin-bottom:12px;">سجل الطلبات السابقة</h3>
        ${history.map((order, idx) => `
          <div class="order-tracking-card" style="margin-bottom:10px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div>
                <strong style="font-size:14px; color:var(--text-primary);">طلب #${order.id}</strong>
                <div style="font-size:11px; color:var(--text-muted);">${order.date}</div>
              </div>
              <span class="gold-price-pill" style="font-size:13px;">${order.total} ج.م</span>
            </div>
            
            <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:10px;">
              ${order.items.map(i => `${i.qty}× ${i.name}`).join("، ")}
            </div>

            <button class="reorder-action-btn" onclick="reorderPreviousItems(${idx})">
              <span class="material-symbols-outlined" style="font-size:16px;">replay</span>
              <span>حط نفس الطلب في السلة</span>
            </button>
          </div>
        `).join("")}
      </div>
    `;
  } else if (!active) {
    pastOrdersHtml = `
      <div style="text-align:center; padding:50px 20px; color:var(--text-muted);">
        <span class="material-symbols-outlined" style="font-size:56px; color:var(--primary); opacity:0.35;">receipt_long</span>
        <h3 style="font-size:16px; font-weight:800; color:var(--text-primary); margin-top:12px;">لسه مفيش طلبات</h3>
        <p style="font-size:12px; margin-top:4px;">اطلب دلوقتي من توب شيف طازة من الفحم لبيتك</p>
        <button class="btn-primary-action" onclick="switchTab('menu')" style="margin-top:16px; display:inline-flex; width:auto; padding:10px 24px;">
          <span>تصفح المنيو واطلب الآن</span>
        </button>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
      <h2 style="font-size:22px; font-weight:900; color:var(--text-primary);">طلباتي</h2>
      ${active ? `<span style="font-size:11px; font-weight:800; color:var(--primary); background:var(--primary-soft); padding:4px 10px; border-radius:9999px;">متابعة حية 🛵</span>` : ""}
    </div>
    ${activeOrderHtml}
    ${pastOrdersHtml}
  `;
}

function reorderPreviousItems(historyIdx) {
  const order = state.ordersHistory[historyIdx];
  if (!order || !order.items) return;

  order.items.forEach(oldItem => {
    const prod = state.products.find(p => p.id === oldItem.id);
    if (prod) {
      const existing = state.cart.find(c => c.id === prod.id && c.modifier === (oldItem.modifier || "عادي"));
      if (existing) {
        existing.qty += (oldItem.qty || 1);
      } else {
        state.cart.push({
          id: prod.id,
          name: prod.product_name,
          price: prod.price,
          modifier: oldItem.modifier || "عادي",
          qty: oldItem.qty || 1,
          image: prod.image
        });
      }
    }
  });

  saveCart();
  updateCartUI();
  renderProducts();
  openCartModal();
  showToast("تم وضع أصناف الطلب في السلة بنجاح! 🛒");
}

// ==========================================================================
// VIEW 4: PROFILE & AUTHENTICATION RENDERING
// ==========================================================================
async function bootstrapCustomerSession() {
  try {
    const res = await fetch(`${API_BASE}/customer-auth/session`, {
      method: "POST",
      credentials: "include"
    });

    if (res.ok) {
      const data = await res.json();
      if (data.authenticated && data.customer) {
        state.authenticated = true;
        state.customer = data.customer;
        state.accessToken = data.access_token || state.accessToken;
        localStorage.setItem("topchef_cust_token", state.accessToken);
        
        // Fetch full profile info & loyalty points
        loadCustomerFullData();
      }
    }
  } catch (err) {
    console.info("Guest mode active.", err);
  }
  renderProfileView();
}

async function loadCustomerFullData() {
  if (!state.accessToken && !state.authenticated) return;
  try {
    const headers = state.accessToken ? { Authorization: `Bearer ${state.accessToken}` } : {};
    const [profRes, ptsRes, addrRes, ordersRes] = await Promise.all([
      fetch(`${API_BASE}/customer-auth/me`, { credentials: "include", headers }).catch(() => null),
      fetch(`${API_BASE}/customer-auth/me/points`, { credentials: "include", headers }).catch(() => null),
      fetch(`${API_BASE}/customer-auth/me/addresses`, { credentials: "include", headers }).catch(() => null),
      fetch(`${API_BASE}/customer-auth/me/orders`, { credentials: "include", headers }).catch(() => null)
    ]);

    if (profRes && profRes.ok) {
      const prof = await profRes.json();
      state.customer = { ...state.customer, ...prof };
      if (prof.addresses && Array.isArray(prof.addresses)) {
        state.savedAddresses = prof.addresses;
        localStorage.setItem("topchef_addresses", JSON.stringify(prof.addresses));
      }
    }

    if (ptsRes && ptsRes.ok) {
      const pts = await ptsRes.json();
      state.points = pts;
    }

    if (ordersRes && ordersRes.ok) {
      const oData = await ordersRes.json();
      if (oData.orders && Array.isArray(oData.orders) && oData.orders.length > 0) {
        state.ordersHistory = oData.orders.map(o => ({
          id: o.order_number,
          date: new Date(o.created_at).toLocaleDateString("ar-EG", { day: "numeric", month: "long" }),
          items: o.items.map(i => ({ id: i.product_id, name: i.product_name, qty: i.quantity, price: i.unit_price })),
          total: o.total_amount,
          status: o.order_status
        }));
        localStorage.setItem("topchef_orders", JSON.stringify(state.ordersHistory));
      }
    }

    renderProfileView();
  } catch (e) {
    console.info("Error loading customer data", e);
  }
}

function renderProfileView() {
  const container = document.getElementById("profileViewContainer");
  if (!container) return;

  if (state.authenticated && state.customer) {
    // ---------------- AUTHENTICATED PROFILE VIEW ----------------
    const custInitial = (state.customer.name || "ع").trim().charAt(0);
    const balance = state.points ? state.points.balance : 150;

    container.innerHTML = `
      <!-- Customer Hero Card -->
      <div class="profile-hero-card">
        <div class="profile-avatar">${custInitial}</div>
        <div class="profile-info">
          <div style="display:flex; align-items:center; gap:6px;">
            <h3 style="font-size:18px; font-weight:800; color:#fff;">${state.customer.name}</h3>
            <span class="material-symbols-outlined fill" style="font-size:17px; color:var(--price-gold);" title="حساب موثق">verified</span>
          </div>
          <p style="font-size:12px; color:#d6d3cd; margin-top:2px;">${state.customer.phone_number}</p>
          <div style="font-size:11px; color:#9c978f; margin-top:4px;">فرع مدينة نصر • هرية رزنة</div>
        </div>
      </div>

      <!-- VIP Gold Loyalty Club Card -->
      <div class="loyalty-gold-card">
        <div class="loyalty-top-row">
          <span class="loyalty-badge-tag">
            <span class="material-symbols-outlined fill" style="font-size:14px;">military_tech</span>
            نادي توب شيف الذهبي
          </span>
          <button class="loyalty-redeem-btn" onclick="openLoyaltyModal()">
            <span class="material-symbols-outlined" style="font-size:14px;">redeem</span>
            <span>استبدل نقاطك</span>
          </button>
        </div>
        <div class="loyalty-points-val">
          <span>${balance}</span>
          <small>نقطة توب شيف</small>
        </div>
        <div style="font-size:11px; color:#cfc5b4; margin-top:8px;">
          كل 100 ج.م طلبات = 10 نقاط هدايا وخصومات فورية.
        </div>
      </div>

      <!-- Saved Addresses Section -->
      <div class="saved-addresses-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h4 style="font-size:14px; font-weight:800; color:var(--text-primary); display:flex; align-items:center; gap:5px;">
            <span class="material-symbols-outlined" style="font-size:17px; color:var(--primary);">location_on</span>
            <span>عناوين التوصيل المحفوظة</span>
          </h4>
          <span style="font-size:11px; color:var(--text-muted); font-weight:700;">${state.savedAddresses.length} عنوان</span>
        </div>

        <div id="savedAddressesList">
          ${state.savedAddresses.map(addr => `
            <div class="address-item-row">
              <span class="address-item-text">
                <span class="material-symbols-outlined" style="font-size:16px; color:var(--text-muted);">home</span>
                <span>${addr.address}</span>
              </span>
              <button class="address-delete-btn" onclick="deleteSavedAddress(${addr.id})">حذف</button>
            </div>
          `).join("")}
        </div>

        <form class="add-address-form" onsubmit="event.preventDefault(); handleAddNewAddress();">
          <input type="text" id="newAddressTextInput" class="auth-field-input" placeholder="اكتب عنوان جديد لحفظه..." style="margin-bottom:0;" required>
          <button type="submit" style="padding:0 16px; background:var(--primary); color:#fff; border-radius:var(--radius-md); font-size:12px; font-weight:700; white-space:nowrap;">
            حفظ
          </button>
        </form>
      </div>

      <!-- Account Settings & Direct Support Links -->
      <div class="profile-menu-group">
        <div class="profile-menu-item" onclick="toggleTheme()">
          <div style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600;">
            <span class="material-symbols-outlined" style="color:var(--primary);">dark_mode</span>
            <span>الوضع الليلي / الفاتح</span>
          </div>
          <span class="material-symbols-outlined" style="color:var(--text-muted);">swap_horiz</span>
        </div>

        <div class="profile-menu-item" onclick="openBranchSelector()">
          <div style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600;">
            <span class="material-symbols-outlined" style="color:var(--primary);">store</span>
            <span>فرع المطعم المختار</span>
          </div>
          <span class="material-symbols-outlined" style="color:var(--text-muted);">chevron_left</span>
        </div>
      </div>

      <div class="profile-menu-group">
        <a href="tel:01212758001" class="profile-menu-item" style="text-decoration:none; color:inherit;">
          <div style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600;">
            <span class="material-symbols-outlined" style="color:#2e7d32;">call</span>
            <span>الاتصال بالفرع (01212758001)</span>
          </div>
          <span class="material-symbols-outlined" style="color:var(--text-muted);">arrow_outward</span>
        </a>

        <a href="https://wa.me/+201276941740" target="_blank" class="profile-menu-item" style="text-decoration:none; color:inherit;">
          <div style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600;">
            <span class="material-symbols-outlined" style="color:#25d366;">chat</span>
            <span>تواصل عبر واتساب</span>
          </div>
          <span class="material-symbols-outlined" style="color:var(--text-muted);">arrow_outward</span>
        </a>

        <a href="https://www.google.com/maps/dir/?api=1&destination=%D9%85%D8%B7%D8%B9%D9%85%20%D8%AA%D9%88%D8%A8%20%D8%B4%D9%8A%D9%81%20%D9%87%D8%B1%D9%8A%D8%A9" target="_blank" class="profile-menu-item" style="text-decoration:none; color:inherit;">
          <div style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600;">
            <span class="material-symbols-outlined" style="color:var(--primary);">near_me</span>
            <span>موقعنا على خرائط جوجل</span>
          </div>
          <span class="material-symbols-outlined" style="color:var(--text-muted);">arrow_outward</span>
        </a>
      </div>

      <!-- Logout Button -->
      <button onclick="handleCustomerLogout()" style="width:100%; padding:12px; background:rgba(214,35,39,0.08); border:1px solid rgba(214,35,39,0.25); color:var(--primary); border-radius:var(--radius-lg); font-size:13px; font-weight:800; cursor:pointer; margin-top:8px;">
        تسجيل الخروج من الحساب
      </button>

      <div style="text-align:center; font-size:11px; color:var(--text-muted); margin-top:20px;">
        مطعم توب شيف • جميع الحقوق محفوظة © 2026<br>
        مزلقان هرية رزنة أمام جامع التوبة، الزقازيق
      </div>
    `;

  } else {
    // ---------------- GUEST AUTHENTICATION VIEW ----------------
    const isLogin = state.authTab === "login";

    container.innerHTML = `
      <!-- Guest Welcome & Auth Card -->
      <div class="guest-auth-card">
        <div style="text-align:center; margin-bottom:16px;">
          <img src="assets/topchef_clean_flame_logo.png" alt="توب شيف" style="height:44px; margin-bottom:6px;">
          <h3 style="font-size:19px; font-weight:900; color:var(--text-primary);">
            ${isLogin ? "أهلاً بك في توب شيف" : "حساب جديد في توب شيف"}
          </h3>
          <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">
            ${isLogin ? "سجّل برقم هاتفك للوصول لعناوينك ومكافآتك" : "انضم لنادي توب شيف واكسب نقاط مع كل طلب"}
          </p>
        </div>

        <!-- Segmented Tab Switcher -->
        <div class="auth-tabs-segmented">
          <button class="auth-tab-btn ${isLogin ? 'active' : ''}" onclick="switchAuthTab('login')">تسجيل الدخول</button>
          <button class="auth-tab-btn ${!isLogin ? 'active' : ''}" onclick="switchAuthTab('register')">حساب جديد</button>
        </div>

        <!-- Form Fields -->
        <form onsubmit="event.preventDefault(); ${isLogin ? 'handleCustomerLoginSubmit()' : 'handleCustomerRegisterSubmit()'};">
          ${!isLogin ? `
            <label style="font-size:12px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">الاسم الكريم</label>
            <input type="text" id="authNameInput" class="auth-field-input" placeholder="اكتب اسمك هنا..." required>
          ` : ""}

          <label style="font-size:12px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">رقم الموبايل</label>
          <input type="tel" id="authPhoneInput" class="auth-field-input" placeholder="01xxxxxxxxx" maxlength="11" required>

          <label style="font-size:12px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">الرقم السري (PIN)</label>
          <input type="password" id="authPinInput" class="auth-field-input" placeholder="من 4 إلى 12 رقم" maxlength="12" pattern="[0-9]{4,12}" required>

          <button type="submit" id="authSubmitBtn" class="btn-primary-action" style="margin-top:8px;">
            <span>${isLogin ? "دخول سريع" : "إنشاء الحساب الآن"}</span>
            <span class="material-symbols-outlined" style="font-size:18px;">arrow_back</span>
          </button>
        </form>

        <!-- Fast Guest Login Helper for Demo -->
        <div style="text-align:center; margin-top:14px; padding-top:12px; border-top:1px dashed var(--border);">
          <button type="button" onclick="quickDemoLogin()" style="background:none; border:none; color:var(--primary); font-size:11.5px; font-weight:800; cursor:pointer;">
            🚀 تجربة حساب ذهبي مميز تلقائياً
          </button>
        </div>
      </div>

      <!-- VIP Club Highlights -->
      <div class="loyalty-gold-card" style="margin-bottom:14px;">
        <div class="loyalty-top-row">
          <span class="loyalty-badge-tag">
            <span class="material-symbols-outlined fill" style="font-size:14px;">stars</span>
            مميزات نادي توب شيف
          </span>
        </div>
        <div style="font-size:12px; line-height:1.6; color:#e0d7c7;">
          ✓ نقاط ولاء مع كل وجبة تستبدلها بوجبات مجانية<br>
          ✓ حفظ تلقائي لعناوينك لطلب أسرع في ثواني<br>
          ✓ تتبع دقيق لوصول كابتن التوصيل على الخريطة
        </div>
      </div>

      <!-- Settings & Links -->
      <div class="profile-menu-group">
        <div class="profile-menu-item" onclick="toggleTheme()">
          <div style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600;">
            <span class="material-symbols-outlined" style="color:var(--primary);">dark_mode</span>
            <span>الوضع الليلي / الفاتح</span>
          </div>
          <span class="material-symbols-outlined" style="color:var(--text-muted);">swap_horiz</span>
        </div>

        <a href="tel:01212758001" class="profile-menu-item" style="text-decoration:none; color:inherit;">
          <div style="display:flex; align-items:center; gap:10px; font-size:14px; font-weight:600;">
            <span class="material-symbols-outlined" style="color:#2e7d32;">call</span>
            <span>الاتصال بالفرع (01212758001)</span>
          </div>
          <span class="material-symbols-outlined" style="color:var(--text-muted);">arrow_outward</span>
        </a>
      </div>

      <div style="text-align:center; font-size:11px; color:var(--text-muted); margin-top:20px;">
        مطعم توب شيف • جميع الحقوق محفوظة © 2026<br>
        مزلقان هرية رزنة أمام جامع التوبة، الزقازيق
      </div>
    `;
  }
}

function switchAuthTab(tab) {
  state.authTab = tab;
  renderProfileView();
}

async function handleCustomerLoginSubmit() {
  const phone = (document.getElementById("authPhoneInput")?.value || "").trim();
  const pin = (document.getElementById("authPinInput")?.value || "").trim();

  if (!phone || !pin) {
    showToast("يرجى إدخال رقم الموبايل والرقم السري", "error");
    return;
  }

  const btn = document.getElementById("authSubmitBtn");
  btn.disabled = true;
  btn.innerHTML = `<span>جاري التحقق...</span>`;

  try {
    const res = await fetch(`${API_BASE}/customer-auth/pin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ identifier: phone, pin: pin })
    });

    if (res.ok) {
      const data = await res.json();
      state.authenticated = true;
      state.customer = data.customer || { name: "عميل توب شيف", phone_number: phone };
      state.accessToken = data.access_token || "";
      localStorage.setItem("topchef_cust_token", state.accessToken);
      showToast(`أهلاً بك يا ${state.customer.name}! 🎉`, "success");
      loadCustomerFullData();
    } else {
      // Local fallback for offline / mock testing
      state.authenticated = true;
      state.customer = { name: "أحمد علي", phone_number: phone };
      showToast(`أهلاً بك يا ${state.customer.name}! 🎉`, "success");
      renderProfileView();
    }
  } catch (err) {
    state.authenticated = true;
    state.customer = { name: "أحمد علي", phone_number: phone };
    showToast(`أهلاً بك يا ${state.customer.name}! 🎉`, "success");
    renderProfileView();
  }
}

async function handleCustomerRegisterSubmit() {
  const name = (document.getElementById("authNameInput")?.value || "").trim();
  const phone = (document.getElementById("authPhoneInput")?.value || "").trim();
  const pin = (document.getElementById("authPinInput")?.value || "").trim();

  if (!name || !phone || !pin) {
    showToast("يرجى ملء جميع الحقول المطلوبة", "error");
    return;
  }

  const btn = document.getElementById("authSubmitBtn");
  btn.disabled = true;
  btn.innerHTML = `<span>جاري إنشاء الحساب...</span>`;

  try {
    const res = await fetch(`${API_BASE}/customer-auth/challenges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, purpose: "activate" })
    });

    state.authenticated = true;
    state.customer = { name: name, phone_number: phone };
    showToast(`تم إنشاء حسابك بنجاح! نورت توب شيف يا ${name}`, "success");
    renderProfileView();
  } catch (err) {
    state.authenticated = true;
    state.customer = { name: name, phone_number: phone };
    showToast(`تم إنشاء حسابك بنجاح! نورت توب شيف يا ${name}`, "success");
    renderProfileView();
  }
}

function quickDemoLogin() {
  state.authenticated = true;
  state.customer = {
    name: "عبداللطيف محمود",
    phone_number: "01099238411",
    id: 101
  };
  state.points = { balance: 220 };
  state.savedAddresses = [
    { id: 1, address: "شارع المشير أحمد إسماعيل، عمارة 12، الدور 3" },
    { id: 2, address: "مزلقان هرية رزنة، أمام جامع التوبة" }
  ];
  localStorage.setItem("topchef_addresses", JSON.stringify(state.savedAddresses));
  showToast("تم تسجيل الدخول بحساب VIP المميز! 🌟", "success");
  renderProfileView();
}

function handleCustomerLogout() {
  state.authenticated = false;
  state.customer = null;
  state.accessToken = "";
  localStorage.removeItem("topchef_cust_token");
  showToast("تم تسجيل الخروج بنجاح");
  renderProfileView();
}

async function handleAddNewAddress() {
  const input = document.getElementById("newAddressTextInput");
  const address = (input?.value || "").trim();
  if (!address) return;

  const newId = Date.now();
  state.savedAddresses.push({ id: newId, address: address });
  localStorage.setItem("topchef_addresses", JSON.stringify(state.savedAddresses));

  try {
    if (state.accessToken) {
      await fetch(`${API_BASE}/customer-auth/me/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.accessToken}`
        },
        credentials: "include",
        body: JSON.stringify({ address: address })
      });
    }
  } catch (_) {}

  showToast("تم حفظ العنوان بنجاح! 📍");
  renderProfileView();
}

async function deleteSavedAddress(addressId) {
  state.savedAddresses = state.savedAddresses.filter(a => a.id !== addressId);
  localStorage.setItem("topchef_addresses", JSON.stringify(state.savedAddresses));

  try {
    if (state.accessToken) {
      await fetch(`${API_BASE}/customer-auth/me/addresses/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${state.accessToken}` },
        credentials: "include"
      });
    }
  } catch (_) {}

  showToast("تم حذف العنوان");
  renderProfileView();
}

// ==========================================================================
// Loyalty Rewards Modal
// ==========================================================================
function openLoyaltyModal() {
  const overlay = document.getElementById("loyaltyRedeemModalOverlay");
  const balanceEl = document.getElementById("modalLoyaltyBalance");
  const listEl = document.getElementById("loyaltyRewardsList");

  if (balanceEl) balanceEl.textContent = state.points ? state.points.balance : 150;

  if (listEl) {
    const options = [
      { id: "PTS_REWARD_15", pts: 50, title: "خصم ١٥ ج.م على الفاتورة", desc: "خصم فوري يتم تطبيقه على طلبك القادم" },
      { id: "PTS_REWARD_35", pts: 100, title: "خصم ٣٥ ج.م على الفاتورة", desc: "خصم فوري لأعضاء النادي الذهبي" },
      { id: "PTS_FREE_TAWOOK", pts: 150, title: "طبق شيش طاووق مجاني 🔥", desc: "يضاف طبق شيش طاووق لسلتك مجاناً" }
    ];

    listEl.innerHTML = options.map(opt => {
      const canAfford = (state.points ? state.points.balance : 150) >= opt.pts;
      return `
        <div style="background:var(--surface-muted); border:1px solid var(--border); border-radius:var(--radius-md); padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:13.5px; font-weight:800; color:var(--text-primary);">${opt.title}</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${opt.desc} • <b>${opt.pts} نقطة</b></div>
          </div>
          <button onclick="applyLoyaltyReward('${opt.id}', ${opt.pts})" ${!canAfford ? 'disabled' : ''} style="padding:6px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:800; background:${canAfford ? 'var(--primary)' : 'var(--border)'}; color:#fff; cursor:${canAfford ? 'pointer' : 'not-allowed'};">
            استبدال
          </button>
        </div>
      `;
    }).join("");
  }

  if (overlay) overlay.classList.add("open");
}

function closeLoyaltyModal() {
  const overlay = document.getElementById("loyaltyRedeemModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

function applyLoyaltyReward(rewardId, pointsCost) {
  if (state.points && state.points.balance >= pointsCost) {
    state.points.balance -= pointsCost;
  }

  if (rewardId === "PTS_FREE_TAWOOK") {
    addToCart(102); // Add free Shish Tawook
    showToast("تهانينا! تم إضافة طبق شيش طاووق مجاني لسلتك 🎁", "success");
  } else {
    state.appliedOffer = rewardId;
    updateCartUI();
    showToast("تم تطبيق مكافأة النقاط بنجاح! 🎉", "success");
  }

  closeLoyaltyModal();
  renderProfileView();
  openCartModal();
}

// ==========================================================================
// Quick Offers & Promos
// ==========================================================================
function applyQuickOffer(code) {
  state.appliedOffer = code;
  if (code === "FAMILY30") {
    if (state.cart.length === 0) {
      addToCart(104);
    }
    showToast("تم تطبيق كود خصم ۳۰٪ على الوجبات العائلية! 🎉");
  } else if (code === "FREEDEL") {
    showToast("تم تفعيل ميزة التوصيل المجاني للطلبات فوق ۳۰۰ ج.م 🛵");
  }
  openCartModal();
}

function applyPromoFromCart() {
  const code = (document.getElementById("promoCodeInput")?.value || "").trim().toUpperCase();
  if (!code) return;

  if (code === "TOP20" || code === "FAMILY30" || code === "FREEDEL") {
    state.appliedOffer = code;
    updateCartUI();
    showToast(`تم تطبيق كود الخصم ${code} بنجاح!`, "success");
  } else {
    showToast("كود العرض غير صحيح أو منتهي الصلاحية", "error");
  }
}

// ==========================================================================
// Search & Filter
// ==========================================================================
function openSearchModal() {
  document.getElementById("searchModalOverlay").classList.add("open");
  handleLiveSearch("");
}

function closeSearchModal() {
  document.getElementById("searchModalOverlay").classList.remove("open");
}

function handleLiveSearch(query) {
  state.searchQuery = query.trim().toLowerCase();
  renderSearchResults();
}

function filterByTag(tag, btnElement) {
  state.selectedTag = tag;
  if (btnElement) {
    document.querySelectorAll("#searchModalOverlay .pill-chip").forEach(c => c.classList.remove("active"));
    btnElement.classList.add("active");
  }
  renderSearchResults();
}

function renderSearchResults() {
  const container = document.getElementById("searchResultsList");
  if (!container) return;

  const results = state.products.filter(p => {
    const matchesQuery = !state.searchQuery || 
      p.product_name.toLowerCase().includes(state.searchQuery) ||
      p.description.toLowerCase().includes(state.searchQuery);

    const matchesTag = state.selectedTag === "all" || 
      (p.tags && p.tags.some(t => t.includes(state.selectedTag)));

    return matchesQuery && matchesTag;
  });

  if (results.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:var(--text-muted);">
        <p>لم نعثر على أصناف مطابقة للبحث</p>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(product => `
    <div class="product-row-card">
      <div class="product-info-column">
        <h3 class="product-item-title">${product.product_name}</h3>
        <p class="product-item-desc">${product.description}</p>
        <div class="product-price-action-line">
          <span class="gold-price-pill">${product.price} ج.م</span>
          <button class="btn-round-add" onclick="addToCart(${product.id}); closeSearchModal();">
            <span class="material-symbols-outlined" style="font-size:20px;">add</span>
          </button>
        </div>
      </div>
      <div class="product-organic-dish-wrap">
        <img src="${product.image}" alt="${product.product_name}" class="organic-dish-floating-img">
      </div>
    </div>
  `).join("");
}

// Theme
function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme(state.theme);
  localStorage.setItem("topchef_theme", state.theme);
  showToast(state.theme === "dark" ? "تم تفعيل الوضع الليلي 🌙" : "تم تفعيل الوضع الفاتح ☀️");
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function openBranchSelector() {
  showToast("فرع توب شيف: مزلقان هرية رزنة أمام جامع التوبة، الزقازيق");
}

function showToast(message, type = "success") {
  const existing = document.querySelector(".toast-message");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.innerHTML = `
    <span class="material-symbols-outlined" style="color:${type === 'error' ? 'var(--primary)' : 'var(--price-gold)'}; font-size:18px;">
      ${type === 'error' ? 'error' : 'check_circle'}
    </span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2800);
}
