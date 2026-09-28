const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const form = document.querySelector("[data-consult-form]");
const message = document.querySelector("[data-form-message]");

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

menuButton.addEventListener("click", () => {
  nav.classList.toggle("is-open");
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
  }
});

const snapTargets = [...document.querySelectorAll("main > section, .footer")];
let isSnapScrolling = false;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getSnapPoints() {
  const headerOffset = 76;
  const viewport = window.innerHeight;
  const maxScroll = document.documentElement.scrollHeight - viewport;
  const points = new Set([0, Math.max(0, maxScroll)]);

  snapTargets.forEach((target) => {
    const top = Math.max(0, target.offsetTop - headerOffset);
    points.add(Math.round(top));
  });

  return [...points].sort((a, b) => a - b);
}

function animateScrollTo(targetY) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = Math.min(1150, Math.max(820, Math.abs(distance) * 0.32));
  const startTime = performance.now();

  isSnapScrolling = true;

  function step(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));

    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }

    window.scrollTo(0, targetY);
    setTimeout(() => {
      isSnapScrolling = false;
    }, 80);
  }

  requestAnimationFrame(step);
}

window.addEventListener(
  "wheel",
  (event) => {
    if (event.ctrlKey || Math.abs(event.deltaY) < 45) return;

    event.preventDefault();
    if (isSnapScrolling) return;

    const current = window.scrollY;
    const points = getSnapPoints();
    const direction = Math.sign(event.deltaY);
    const target =
      direction > 0
        ? points.find((point) => point > current + 48)
        : [...points].reverse().find((point) => point < current - 48);

    if (target !== undefined) {
      animateScrollTo(target);
    }
  },
  { passive: false }
);

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
