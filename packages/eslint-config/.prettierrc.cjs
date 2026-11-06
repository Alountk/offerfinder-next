module.exports = {
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: require('node:path').resolve(__dirname, '../../apps/web/app/globals.css'),
  arrowParens: 'avoid',
  bracketSpacing: false,
  bracketSameLine: false,
  printWidth: 120,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false
}
