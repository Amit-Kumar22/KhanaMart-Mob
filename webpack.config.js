const { getDefaultConfig } = require('expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await getDefaultConfig(env, argv);
  
  // Ensure that NativeWind/Tailwind CSS works on web
  config.module.rules.push({
    test: /\.css$/,
    use: ['style-loader', 'css-loader', 'postcss-loader'],
  });

  return config;
};