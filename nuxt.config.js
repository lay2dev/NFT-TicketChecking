// import path from 'path'
// import fs from 'fs'
export default {
  ssr: false,
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'NFT Ticket Checking',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no',
      },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        ref: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/normalize.css@latest/normalize.min.css',
      },
    ],
    script: [
      // { src: '' },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['@assets/css/main.css'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/element-ui',
    '~/plugins/main',
    '~/plugins/bigsea',
    '~/plugins/socket',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxtjs/dotenv',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    // '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    '@nuxt/content',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  // pwa: {
  //   manifest: {
  //     lang: 'en',
  //   },
  //   icon: {
  //     fileName: 'icon.png',
  //   },
  // },

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/],
    publicPath: process.env.OSS_PUBLIC_PATH,
  },
  env: {
    environment: process.env.NODE_ENV,
  },

  // eslint
  eslint: {
    fix: true,
  },

  // server
  server: {
    // host: '0.0.0.0',
    port: 5002,
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, 'bin/cert.key')),
    //   cert: fs.readFileSync(path.resolve(__dirname, 'bin/cert.crt')),
    // },
  },
}
