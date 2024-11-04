module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'server.mjs',
    },
    {
      name: 'frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
