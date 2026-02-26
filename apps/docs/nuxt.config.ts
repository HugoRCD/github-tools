export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },
  content: {
    experimental: {
      sqliteConnector: 'native'
    }
  },
  mcp: {
    name: 'GitHub Tools MCP',
  },
  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons',
      },
    ],
  },
})
