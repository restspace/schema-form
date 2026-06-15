// Babel config used only by Jest (the rollup build type-checks/compiles via
// rollup-plugin-typescript2, not Babel). preset-react enables JSX transform in
// component tests; runtime "automatic" means test files don't need React in scope.
module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
      ['@babel/preset-react', { runtime: 'automatic' }],
      '@babel/preset-typescript',
    ]
  };