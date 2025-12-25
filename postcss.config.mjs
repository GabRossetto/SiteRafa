/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // AQUI MUDOU: Antes era 'tailwindcss', agora é o nome do pacote novo
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;