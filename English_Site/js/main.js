
const componentNodes = document.querySelectorAll("[data-component]");

const isGitHubPages =
  window.location.hostname.endsWith("github.io") &&
  window.location.pathname.startsWith("/puntachen-site/");

const siteRoot = isGitHubPages ? "/puntachen-site/" : "/";

const getLanguagePaths = () => {
  const path = window.location.pathname;
  const isEnglish = path.includes("/English_Site/");

  const sitePrefix = isGitHubPages ? "/puntachen-site" : "";

  const normalizedPath = path
    .replace(sitePrefix, "")
    .replace(/\/+$/, "");

  const relativePath = isEnglish
    ? normalizedPath.replace(/^\/English_Site\/?/, "")
    : normalizedPath.replace(/^\/+/, "");

  const pageMap = {
    "index.html": "index.html",
    "pages/infraestructura.html": "pages/infraestructura.html",
    "pages/cooperativa.html": "pages/cooperativa.html",
    "pages/purificadora.html": "pages/purificadora.html",
    "pages/contacto.html": "pages/contacto.html"
  };

  const currentPage = relativePath || "index.html";
  const equivalentPage = pageMap[currentPage] || "index.html";

  const spanishBase = isGitHubPages ? "/puntachen-site/" : "/";
  const englishBase = isGitHubPages
    ? "/puntachen-site/English_Site/"
    : "/English_Site/";

  return {
    currentPage: `${isEnglish ? englishBase : spanishBase}${equivalentPage}`,
    languagePage: `${isEnglish ? spanishBase : englishBase}${equivalentPage}`
  };
};

const loadComponent = async (node) => {
  const componentName = node.dataset.component;
  const path = window.location.pathname;
  const isNestedPage = path.includes("/pages/");
  const isEnglish = path.includes("/English_Site/");
  const rootPath = isNestedPage ? "../" : "";
  const pagePath = isNestedPage ? "" : "pages/";
  const componentPath = `${rootPath}components/${componentName}.html`;

  try {
    const response = await fetch(componentPath);

    if (!response.ok) {
      console.warn(`No se pudo cargar el componente ${componentName}.`);
      return;
    }

    const componentMarkup = await response.text();
    const languagePaths = getLanguagePaths();

    node.innerHTML = componentMarkup
      .replaceAll("{{ROOT}}", rootPath)
      .replaceAll("{{PAGES}}", pagePath)
      .replaceAll("{{SITE_ROOT}}", siteRoot)
      .replaceAll("{{CURRENT_PAGE}}", languagePaths.currentPage)
      .replaceAll("{{LANGUAGE_PAGE}}", languagePaths.languagePage);

  } catch (error) {
    console.warn(`No se pudo cargar el componente ${componentName}.`, error);
  }
};

const setHeaderState = (header) => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

const setNavigationAccess = (nav, isAccessible) => {
  nav.toggleAttribute("inert", !isAccessible);
  nav.setAttribute("aria-hidden", String(!isAccessible));
};

const initHeader = () => {
  const header = document.querySelector("[data-site-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (!header || !toggle || !nav) return;

  const desktopQuery = window.matchMedia("(min-width: 1024px)");

  const closeMobileMenu = () => {
    header.classList.remove("is-open");
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("is-menu-open");
  };

  const syncNavigation = () => {
    closeMobileMenu();
    setNavigationAccess(nav, desktopQuery.matches);
  };

  setHeaderState(header);
  syncNavigation();

  window.addEventListener(
    "scroll",
    () => setHeaderState(header),
    { passive: true }
  );

  toggle.addEventListener("click", () => {
    const shouldOpen = toggle.getAttribute("aria-expanded") !== "true";

    header.classList.toggle("is-open", shouldOpen);
    nav.classList.toggle("is-open", shouldOpen);
    setNavigationAccess(nav, shouldOpen);

    toggle.setAttribute("aria-expanded", String(shouldOpen));
    toggle.setAttribute(
      "aria-label",
      shouldOpen ? "Close navigation menu" : "Open navigation menu"
    );

    document.body.classList.toggle("is-menu-open", shouldOpen);
  });

  nav.addEventListener("click", (event) => {
    if (!desktopQuery.matches && event.target.closest("a")) {
      closeMobileMenu();
      setNavigationAccess(nav, false);
    }
  });

  desktopQuery.addEventListener("change", syncNavigation);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !desktopQuery.matches) {
      closeMobileMenu();
      setNavigationAccess(nav, false);
    }
  });
};

Promise.all(
  Array.from(componentNodes, loadComponent)
).then(initHeader);
