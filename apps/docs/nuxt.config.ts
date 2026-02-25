export default defineNuxtConfig({
  extends: ['docus'],
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
  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons',
      },
    ],
  },
})
