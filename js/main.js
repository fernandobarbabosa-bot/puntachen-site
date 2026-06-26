const componentNodes = document.querySelectorAll("[data-component]");

const loadComponent = async (node) => {
  const componentName = node.dataset.component;
  const isNestedPage = window.location.pathname.includes("/pages/");
  const rootPath = isNestedPage ? "../" : "";
  const pagePath = isNestedPage ? "" : "pages/";
  const componentPath = `${rootPath}components/${componentName}.html`;

  try {
    const response = await fetch(componentPath);

    if (!response.ok) {
      return;
    }

    const componentMarkup = await response.text();
    node.innerHTML = componentMarkup
      .replaceAll("{{ROOT}}", rootPath)
      .replaceAll("{{PAGES}}", pagePath);
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

const closeNavigation = (header, nav, toggle) => {
  header.classList.remove("is-open");
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Abrir menu de navegacion");
  document.body.classList.remove("is-menu-open");
  setNavigationAccess(nav, false);
};

const initHeader = () => {
  const header = document.querySelector("[data-site-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (!header || !toggle || !nav) {
    return;
  }

  setHeaderState(header);
  setNavigationAccess(nav, false);

  window.addEventListener("scroll", () => setHeaderState(header), { passive: true });

  toggle.addEventListener("click", () => {
    const shouldOpen = toggle.getAttribute("aria-expanded") !== "true";

    header.classList.toggle("is-open", shouldOpen);
    nav.classList.toggle("is-open", shouldOpen);
    setNavigationAccess(nav, shouldOpen);
    toggle.setAttribute("aria-expanded", String(shouldOpen));
    toggle.setAttribute(
      "aria-label",
      shouldOpen ? "Cerrar menu de navegacion" : "Abrir menu de navegacion"
    );
    document.body.classList.toggle("is-menu-open", shouldOpen);
  });

  nav.addEventListener("click", (event) => {
    const clickedAnchor = event.target.closest("a");
    const clickedNavPanel = event.target.closest(".site-header__nav-panel");

    if (clickedAnchor) {
      closeNavigation(header, nav, toggle);
      return;
    }

    if (event.target === nav || !clickedNavPanel) {
      closeNavigation(header, nav, toggle);
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 1024px)").matches && toggle.getAttribute("aria-expanded") === "true") {
      closeNavigation(header, nav, toggle);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation(header, nav, toggle);
    }
  });
};

Promise.all(Array.from(componentNodes, loadComponent)).then(initHeader);
