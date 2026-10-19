const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const form = document.querySelector("[data-consult-form]");
const message = document.querySelector("[data-form-message]");
const scrollPages = [
  ...document.querySelectorAll("main > section"),
  document.querySelector(".footer"),
].filter(Boolean);

let wheelDelta = 0;
let wheelResetTimer;
let isPageScrolling = false;
let pageScrollTimer;

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

function getCurrentPageIndex() {
  const viewportAnchor = window.scrollY + window.innerHeight * 0.35;
  let currentIndex = 0;

  scrollPages.forEach((page, index) => {
    if (page.offsetTop <= viewportAnchor) {
      currentIndex = index;
    }
  });

  return currentIndex;
}

function moveToPage(direction) {
  const currentIndex = getCurrentPageIndex();
  const nextIndex = Math.min(
    Math.max(currentIndex + direction, 0),
    scrollPages.length - 1,
  );

  if (nextIndex === currentIndex) return;

  isPageScrolling = true;
  window.scrollTo({
    top: scrollPages[nextIndex].offsetTop,
    behavior: "smooth",
  });

  window.clearTimeout(pageScrollTimer);
  pageScrollTimer = window.setTimeout(() => {
    isPageScrolling = false;
  }, 850);
}

window.addEventListener(
  "wheel",
  (event) => {
    if (event.ctrlKey || event.target.closest("input, textarea, select")) return;

    event.preventDefault();
    if (isPageScrolling) return;

    wheelDelta += event.deltaY;
    window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(() => {
      wheelDelta = 0;
    }, 160);

    if (Math.abs(wheelDelta) < 24) return;

    moveToPage(wheelDelta > 0 ? 1 : -1);
    wheelDelta = 0;
  },
  { passive: false },
);

menuButton.addEventListener("click", () => {
  nav.classList.toggle("is-open");
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const lead = {
    name: data.get("name"),
    phone: data.get("phone"),
    region: data.get("region"),
    consultTime: data.get("consultTime"),
    interests: data.getAll("interest"),
    createdAt: new Date().toISOString(),
  };

  const leads = JSON.parse(localStorage.getItem("dawooFarmConsultLeads") || "[]");
  leads.unshift(lead);
  localStorage.setItem("dawooFarmConsultLeads", JSON.stringify(leads));

  form.reset();
  message.textContent = "상담 신청 정보가 임시 저장되었습니다. 추후 관리자 화면과 연동됩니다.";
});
