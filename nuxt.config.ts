// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/ui", "nuxt-skill-hub"],

  css: ["~/assets/css/main.css"],

  vite: {
    optimizeDeps: {
      include: [
        "idb",
      ],
    },
  },

  app: {
    head: {
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Onest:wght@400;500&family=Source+Code+Pro:wght@400;500&display=swap" },
      ],
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },
});
