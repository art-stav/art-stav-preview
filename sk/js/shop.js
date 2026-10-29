const SITE = {
  phoneDisplay: "+421 900 000 000",
  phoneTel: "+421900000000",
  whatsapp: "421900000000",
  email: "info@art-stav.sk"
};
const CART_KEY = "artstav-cart";
const CATALOG = {
  "clever-pu-110": 195,
  "clever-pu-120": 189
};

function itemPrice(item) {
  return Object.prototype.hasOwnProperty.call(CATALOG, item.id) ? CATALOG[item.id] : Number(item.price) || 0;
}

document.querySelectorAll("[data-phone]").forEach((el) => {
  el.setAttribute("href", "tel:" + SITE.phoneTel);
  if (el.textContent.trim().startsWith("+")) el.textContent = SITE.phoneDisplay;
});
document.querySelectorAll("[data-whatsapp]").forEach((el) => {
  el.setAttribute("href", "https://wa.me/" + SITE.whatsapp);
});
document.querySelectorAll("[data-email]").forEach((el) => {
  el.setAttribute("href", "mailto:" + SITE.email);
  if (!el.dataset.keepText) el.textContent = SITE.email;
});

const header = document.getElementById("header");
const nav = document.getElementById("nav");
const menuToggle = document.getElementById("menu-toggle");
const drop = nav.querySelector(".nav-drop");
const dropBtn = drop.querySelector(".nav-btn");

function lockScroll(on) {
  document.body.style.overflow = on ? "hidden" : "";
}

window.addEventListener("scroll", () => {
  header.classList.toggle("is-stuck", window.scrollY > 8);
}, { passive: true });

function closeMenu() {
  nav.classList.remove("is-open");
  drop.classList.remove("is-open");
  dropBtn.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Otvoriť menu");
  if (!document.getElementById("cart-drawer") || document.getElementById("cart-drawer").hidden) lockScroll(false);
}

menuToggle.addEventListener("click", () => {
  if (nav.classList.contains("is-open")) {
    closeMenu();
    return;
  }
  nav.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Zavrieť menu");
  lockScroll(true);
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => closeMenu());
});

dropBtn.addEventListener("click", () => {
  const open = drop.classList.toggle("is-open");
  dropBtn.setAttribute("aria-expanded", String(open));
});

function rootPrefix() {
  const path = location.pathname.replace(/index\.html$/, "");
  const depth = path.split("/").filter(Boolean).length;
  return "../".repeat(depth);
}

function money(value) {
  return value + " €";
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

const PROMO_KEY = "artstav-promo";

function readPromo() {
  return localStorage.getItem(PROMO_KEY) || "";
}

function readCart() {
  try {
    const data = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  paintCart();
  paintCheckout();
}

function cartCount(items) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal(items) {
  return items.reduce((sum, item) => sum + itemPrice(item) * item.qty, 0);
}

const tools = document.querySelector(".header-tools");
if (tools && !document.getElementById("cart-open")) {
  const opener = document.createElement("button");
  opener.type = "button";
  opener.id = "cart-open";
  opener.className = "cart-open";
  opener.setAttribute("aria-label", "Košík");
  opener.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l-1 12H7L6 7z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 7a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><span class="cart-count" id="cart-count" hidden>0</span>';
  tools.insertBefore(opener, menuToggle);
}

const drawer = document.createElement("div");
drawer.className = "cart-drawer";
drawer.id = "cart-drawer";
drawer.hidden = true;
drawer.innerHTML = '<div class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title"><div class="cart-head"><h2 id="cart-title">Košík</h2><button class="cart-close" type="button" data-cart-close aria-label="Zavrieť">×</button></div><p class="cart-added" id="cart-added" hidden>Tovar bol pridaný do košíka.</p><div id="cart-lines"></div><form class="promo" id="cart-promo"><label class="promo-field"><span class="visually-hidden">Promokód</span><input data-promo-input type="text" placeholder="Promokód" autocomplete="off" maxlength="40"></label><button class="btn btn-beige" type="submit">Použiť</button></form><p class="promo-note" data-promo-note hidden></p><div class="cart-foot"><p class="cart-total"><span>Spolu</span><strong id="cart-sum">0 €</strong></p><p class="price-note" id="cart-price-note">Doprava a daň sú zahrnuté v cene.</p><a class="btn" id="cart-checkout" href="#">Objednať</a></div></div>';
document.body.appendChild(drawer);

const cartLines = document.getElementById("cart-lines");
const cartSum = document.getElementById("cart-sum");
const cartAdded = document.getElementById("cart-added");
const cartCheckout = document.getElementById("cart-checkout");
const cartCountEl = document.getElementById("cart-count");
const cartPromo = document.getElementById("cart-promo");
const cartPriceNote = document.getElementById("cart-price-note");
cartCheckout.href = rootPrefix() + "obchod/pokladna/";

function paintCart() {
  const items = readCart();
  const count = cartCount(items);
  if (count) {
    cartCountEl.hidden = false;
    cartCountEl.textContent = String(count);
  } else {
    cartCountEl.hidden = true;
  }
  if (!items.length) {
    cartLines.innerHTML = '<p class="cart-empty">Košík je prázdny.</p>';
    cartSum.textContent = money(0);
    cartCheckout.hidden = true;
    cartPromo.hidden = true;
    cartPriceNote.hidden = true;
    paintPromo();
    return;
  }
  cartCheckout.hidden = false;
  cartPromo.hidden = false;
  cartPriceNote.hidden = false;
  cartLines.innerHTML = items.map((item) => '<article class="cart-line"><img src="' + rootPrefix() + esc(item.image) + '" alt=""><div class="cart-main"><div><strong>' + esc(item.name) + '</strong><p>' + esc(item.meta) + '</p><div class="qty"><button type="button" data-qty="-1" data-id="' + esc(item.id) + '" aria-label="Menej">−</button><span>' + item.qty + '</span><button type="button" data-qty="1" data-id="' + esc(item.id) + '" aria-label="Viac">+</button></div></div><p class="cart-price">' + money(itemPrice(item) * item.qty) + '</p></div></article>').join("");
  cartSum.textContent = money(cartTotal(items));
  paintPromo();
}

function openCart(justAdded) {
  cartAdded.hidden = !justAdded;
  drawer.hidden = false;
  lockScroll(true);
  drawer.querySelector("[data-cart-close]").focus();
}

function closeCart() {
  drawer.hidden = true;
  if (!nav.classList.contains("is-open")) lockScroll(false);
}

document.getElementById("cart-open").addEventListener("click", () => openCart(false));
drawer.addEventListener("click", (event) => {
  if (event.target === drawer || event.target.closest("[data-cart-close]")) closeCart();
});
cartLines.addEventListener("click", (event) => {
  const button = event.target.closest("[data-qty]");
  if (!button) return;
  const items = readCart();
  const item = items.find((entry) => entry.id === button.dataset.id);
  if (!item) return;
  item.qty += Number(button.dataset.qty);
  writeCart(item.qty > 0 ? items : items.filter((entry) => entry.id !== item.id));
});

const buy = document.getElementById("buy");
if (buy) {
  buy.addEventListener("click", () => {
    const items = readCart();
    const id = buy.dataset.id;
    const existing = items.find((item) => item.id === id);
    if (existing) existing.qty += 1;
    else items.push({
      id: id,
      name: buy.dataset.name,
      meta: buy.dataset.meta,
      price: Number(buy.dataset.price),
      image: buy.dataset.image,
      qty: 1
    });
    writeCart(items);
    openCart(true);
  });
}

function paintCheckout() {
  const box = document.getElementById("checkout-summary");
  if (!box) return;
  const items = readCart();
  const form = document.getElementById("checkout-form");
  if (!items.length) {
    box.innerHTML = '<p class="cart-empty">Košík je prázdny.</p><a class="btn" href="' + rootPrefix() + 'obchod/">Do obchodu</a>';
    if (form) form.hidden = true;
    const extra = document.getElementById("checkout-extra");
    if (extra) extra.hidden = true;
    return;
  }
  if (form) form.hidden = false;
  const extra = document.getElementById("checkout-extra");
  if (extra) extra.hidden = false;
  box.innerHTML = items.map((item) => '<article class="checkout-item"><img src="' + rootPrefix() + esc(item.image) + '" alt=""><div class="cart-main"><div><strong>' + esc(item.name) + '</strong><p>' + esc(item.meta) + '</p><p>' + item.qty + ' ks</p></div><p class="cart-price">' + money(itemPrice(item) * item.qty) + '</p></div></article>').join("");
  const sum = document.getElementById("checkout-sum");
  if (sum) sum.textContent = money(cartTotal(items));
}

const checkoutForm = document.getElementById("checkout-form");
if (checkoutForm) {
  const error = document.getElementById("checkout-error");
  if (new URLSearchParams(location.search).get("platba") === "zrusena") {
    error.textContent = "Platba bola zrušená. Košík ostal uložený.";
  }
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";
    const required = [...checkoutForm.querySelectorAll("[required]")];
    let invalid = null;
    required.forEach((field) => {
      if (invalid) return;
      if (field.type === "radio") {
        const picked = checkoutForm.querySelector('input[name="' + field.name + '"]:checked');
        if (!picked) invalid = field;
      } else if (!field.value.trim()) invalid = field;
    });
    const phone = checkoutForm.querySelector("[name=phone]");
    if (!invalid && phone && phone.value.replace(/\D/g, "").length < 9) invalid = phone;
    if (invalid) {
      error.textContent = "Vyplňte povinné polia. Telefón potrebuje aspoň 9 číslic.";
      invalid.focus();
      return;
    }
    const button = checkoutForm.querySelector("[type=submit]");
    button.disabled = true;
    const data = new FormData(checkoutForm);
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: readCart().map((item) => ({ id: item.id, qty: item.qty })),
        customer: {
          name: String(data.get("name") || "").trim(),
          phone: String(data.get("phone") || "").trim(),
          email: String(data.get("email") || "").trim(),
          street: String(data.get("street") || "").trim(),
          zip: String(data.get("zip") || "").trim(),
          city: String(data.get("city") || "").trim(),
          note: String(data.get("note") || "").trim(),
          promo: readPromo()
        }
      })
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.url) throw new Error(body.error || "Platbu sa nepodarilo otvoriť.");
      window.location.href = body.url;
    }).catch((reason) => {
      error.textContent = reason.message || "Platbu sa nepodarilo otvoriť.";
      button.disabled = false;
    });
  });
}

function paintPromo(message, isError) {
  const code = readPromo();
  document.querySelectorAll(".promo").forEach((form) => {
    const input = form.querySelector("[data-promo-input]");
    const note = form.parentElement.querySelector(":scope > [data-promo-note]");
    if (form.hidden) {
      if (note) note.hidden = true;
      return;
    }
    if (input && document.activeElement !== input) input.value = code;
    if (!note) return;
    if (message) {
      note.hidden = false;
      note.textContent = message;
      note.classList.toggle("is-error", Boolean(isError));
      return;
    }
    note.classList.remove("is-error");
    if (!code) {
      note.hidden = true;
      note.textContent = "";
      return;
    }
    note.hidden = false;
    note.textContent = "Promokód je uložený.";
  });
}

document.querySelectorAll(".promo").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("[data-promo-input]");
    const code = input.value.trim();
    if (!code) {
      localStorage.removeItem(PROMO_KEY);
      paintPromo("Zadajte promokód.", true);
      input.focus();
      return;
    }
    localStorage.setItem(PROMO_KEY, code);
    paintPromo("");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!drawer.hidden) {
    closeCart();
    return;
  }
  if (nav.classList.contains("is-open")) closeMenu();
});

paintCart();
paintCheckout();
