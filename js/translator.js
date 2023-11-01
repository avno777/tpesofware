class Translator {
  constructor(options = {}) {
    this._options = Object.assign({}, this.defaultConfig, options);
    this._lang = this.getLanguage();
    this._elements = document.querySelectorAll("[data-i18n]");
  }

  getLanguage() {
    if (!this._options.detectLanguage) {
      return this._options.defaultLanguage;
    }

    var stored = localStorage.getItem("language");

    if (this._options.persist && stored) {
      return stored;
    }

    var lang = navigator.languages
      ? navigator.languages[0]
      : navigator.language;

    return lang.substr(0, 2);
  }

  load(lang = null) {
    if (!lang) {
      lang = getLanguageFromUrl() || this.getLanguage();
    }

    if (lang) {
      if (!this._options.languages.includes(lang)) {
        return;
      }

      this._lang = lang;
    }

    var path = `${this._options.filesLocation}/${this._lang}.json`;

    fetch(path)
      .then((res) => res.json())
      .then((translation) => {
        this.translate(translation);
        this.toggleLangTag();
        this.setLangLink();

        if (this._options.persist) {
          localStorage.setItem("language", this._lang);
        }
      })
      .catch((err) => {
        console.error(`Could not load ${path}.`, err);
      });
  }

  toggleLangTag() {
    if (document.documentElement.lang !== this._lang) {
      document.documentElement.lang = this._lang;
    }
  }

  setLangLink() {
    const langLinks = document.querySelectorAll("#language-switcher a");
    langLinks.forEach((link) => {
      if (link.getAttribute("data-lang") === this._lang) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  translate(translation) {
    function replace(element) {
      var text = element.dataset.i18n
        .split(".")
        .reduce((obj, i) => obj[i], translation);

      if (text) {
        element.innerHTML = text;
      }
    }

    this._elements.forEach(replace);
  }

  get defaultConfig() {
    return {
      persist: false,
      languages: ["en"],
      defaultLanguage: "en",
      filesLocation: "/i18n",
    };
  }
  setLangInURL(lang) {
    const currentURL = window.location.href.split("?")[0]; // Lấy URL không có tham số truy vấn
    const newURL = `${currentURL}?lang=${lang}`;
    window.history.pushState({}, "", newURL); // Cập nhật URL mà không cần tải lại trang
  }
  updateAllLinks() {
    const currentLang =
      localStorage.getItem("language") || this._options.defaultLanguage;
    document.querySelectorAll("a").forEach((link) => {
      const currentHref = link.getAttribute("href");
      if (currentHref && !currentHref.startsWith("#")) {
        link.setAttribute("href", `${currentHref}?lang=${currentLang}`);
      }
    });
  }
}

function setLanguageInUrl(lang) {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("lang", lang);
  window.history.pushState({}, "", currentUrl.toString());
}

function getLanguageFromUrl() {
  const currentUrl = new URL(window.location.href);
  return currentUrl.searchParams.get("lang");
}

var translator = new Translator({
  persist: true,
  languages: ["en", "vi"],
  defaultLanguage: "en",
  detectLanguage: true,
  filesLocation: "/i18n",
});

translator.load();
translator.updateAllLinks;

document
  .getElementById("language-switcher")
  .addEventListener("click", function (evt) {
    if (evt.target.tagName === "A") {
      evt.preventDefault();
      const lang = evt.target.getAttribute("data-lang");
      translator.load(lang);
      translator.setLangInURL(lang); // Cập nhật tham số lang trong URL
    }
  });

// function applyLanguage(lang) {
//   const elementsToTranslate = document.querySelectorAll("[data-translate]");
//   elementsToTranslate.forEach((element) => {
//     const key = element.getAttribute("data-translate");
//     if (translations[lang][key]) {
//       element.textContent = translations[lang][key];
//     }
//   });
// }

// function updateLanguageLinks(lang) {
//   const linksToUpdate = document.querySelectorAll("[data-lang-link]");
//   linksToUpdate.forEach((linkElement) => {
//     const page = linkElement.getAttribute("data-lang-link");
//     linkElement.href = `${page}.html?lang=${lang}`;
//   });
// }
