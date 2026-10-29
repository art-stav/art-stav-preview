const SITE = {
  phoneDisplay: "+421 900 000 000",
  phoneTel: "+421900000000",
  whatsapp: "421900000000",
  email: "info@art-stav.sk"
};

document.querySelectorAll("[data-phone]").forEach((el) => {
  el.setAttribute("href", "tel:" + SITE.phoneTel);
  if (el.textContent.trim().startsWith("+")) el.textContent = SITE.phoneDisplay;
});
document.querySelectorAll("[data-whatsapp]").forEach((el) => {
  el.setAttribute("href", "https://wa.me/" + SITE.whatsapp);
});
document.querySelectorAll("[data-email]").forEach((el) => {
  el.setAttribute("href", "mailto:" + SITE.email);
  el.textContent = SITE.email;
});

const header = document.getElementById("header");
const nav = document.getElementById("nav");
const menuToggle = document.getElementById("menu-toggle");
const drop = nav.querySelector(".nav-drop");
const dropBtn = drop.querySelector(".nav-btn");

window.addEventListener("scroll", () => {
  header.classList.toggle("is-stuck", window.scrollY > 8);
}, { passive: true });

function lockScroll(locked) {
  document.body.style.overflow = locked ? "hidden" : "";
}

function closeMenu() {
  nav.classList.remove("is-open");
  drop.classList.remove("is-open");
  dropBtn.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Otvoriť menu");
  lockScroll(quiz && !quiz.hidden);
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

function bindPreviews(inputId, listId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;
  const urls = [];
  input.addEventListener("change", () => {
    urls.forEach((url) => URL.revokeObjectURL(url));
    urls.length = 0;
    list.innerHTML = "";
    Array.from(input.files).forEach((file) => {
      const url = URL.createObjectURL(file);
      urls.push(url);
      const li = document.createElement("li");
      const img = document.createElement("img");
      img.src = url;
      img.alt = file.name;
      li.append(img);
      list.append(li);
    });
  });
}

bindPreviews("photos", "previews");
bindPreviews("quiz-photos", "quiz-previews");

function phoneOk(value) {
  return String(value || "").replace(/\D/g, "").length >= 9;
}

const leadForm = document.getElementById("lead-form");
const formError = document.getElementById("form-error");
if (leadForm) leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(leadForm);
  const name = String(data.get("name") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const city = String(data.get("city") || "").trim();
  const service = String(data.get("service") || "").trim();
  const contact = String(data.get("contact") || "").trim();
  if (!name || !phoneOk(phone) || !city || !service || !contact) {
    formError.textContent = "Vyplňte meno, telefón, mesto alebo obec, požadovaný povrch a spôsob kontaktu.";
    return;
  }
  formError.textContent = "Odoslanie sa nepodarilo. Skúste to znova.";
});

const quiz = document.getElementById("quiz");
if (quiz) {
const quizForm = document.getElementById("quiz-form");
const quizSteps = Array.from(quiz.querySelectorAll(".quiz-step"));
const quizNext = document.getElementById("quiz-next");
const quizBack = document.getElementById("quiz-back");
const quizError = document.getElementById("quiz-error");
const quizSuccess = document.getElementById("quiz-success");
const quizProgress = document.getElementById("quiz-progress");
const quizCount = document.getElementById("quiz-count");
let quizStep = 0;

function showQuizStep(index) {
  quizStep = index;
  quizSteps.forEach((step) => {
    step.hidden = Number(step.dataset.step) !== index;
  });
  quizBack.hidden = index === 0;
  quizNext.textContent = index === quizSteps.length - 1 ? "Odoslať dopyt" : "Ďalej";
  if (quizCount) quizCount.textContent = (index + 1) + "/" + quizSteps.length;
  quizProgress.querySelectorAll("i").forEach((bar, i) => bar.classList.toggle("is-on", i <= index));
  quizError.textContent = "";
}

function prefillCoating() {
  const wanted = quiz.dataset.coating;
  if (!wanted || quizForm.querySelector('input[name="coating"]:checked')) return;
  quizForm.querySelectorAll('input[name="coating"]').forEach((input) => {
    if (input.value === wanted) input.checked = true;
  });
}

function openQuiz() {
  if (nav.classList.contains("is-open")) closeMenu();
  prefillCoating();
  quiz.hidden = false;
  quizForm.hidden = false;
  quizSuccess.hidden = true;
  showQuizStep(0);
  lockScroll(true);
  const focusable = quiz.querySelector(".quiz-step:not([hidden]) input, #quiz-next");
  if (focusable) focusable.focus();
}

function closeQuiz() {
  quiz.hidden = true;
  lockScroll(nav.classList.contains("is-open"));
}

document.querySelectorAll("[data-open-quiz]").forEach((button) => {
  button.addEventListener("click", openQuiz);
});
quiz.querySelectorAll("[data-close-quiz]").forEach((button) => {
  button.addEventListener("click", closeQuiz);
});
quiz.addEventListener("click", (event) => {
  if (event.target === quiz) closeQuiz();
});

function quizValue(name) {
  const field = quizForm.elements[name];
  if (!field) return "";
  if (field instanceof RadioNodeList) {
    const checked = quizForm.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : "";
  }
  return String(field.value || "").trim();
}

quizNext.addEventListener("click", () => {
  if (quizStep === 0 && !quizValue("object")) {
    quizError.textContent = "Vyberte, kde plánujete nový povrch.";
    return;
  }
  if (quizStep === 1 && !quizValue("coating")) {
    quizError.textContent = "Vyberte povrch, alebo možnosť poradenstva.";
    return;
  }
  if (quizStep === 2 && !quizValue("city")) {
    quizError.textContent = "Vyplňte mesto alebo obec.";
    return;
  }
  if (quizStep === 3) {
    if (!quizValue("name") || !phoneOk(quizValue("phone")) || !quizValue("contact")) {
      quizError.textContent = "Vyplňte meno, telefón a spôsob kontaktu.";
      return;
    }
    quizError.textContent = "Odoslanie sa nepodarilo. Skúste to znova.";
    return;
  }
  showQuizStep(quizStep + 1);
});

quizBack.addEventListener("click", () => {
  if (quizStep > 0) showQuizStep(quizStep - 1);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!quiz.hidden) closeQuiz();
  else if (nav.classList.contains("is-open")) closeMenu();
});
}
