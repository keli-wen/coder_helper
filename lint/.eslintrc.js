module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'extends': [
    'google',
    'plugin:vue/vue3-essential',
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'plugins': [
    'vue',
  ],
  'rules': {
    'max-len': ['error', { 'code': 100 }],
  },
};
