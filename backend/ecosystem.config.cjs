module.exports = {
  apps: [
    {
      name: "skillflux-backend",
      script: "./server.js",
      instances: "max", // Utilize all available CPU cores
      exec_mode: "cluster", // Enables clustering for better performance
      watch: false, // Don't watch files in production
      max_memory_restart: "1G", // Restart if process memory exceeds 1GB
      env: {
        NODE_ENV: "development",
        PORT: 5000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000
      },
      error_file: "logs/pm2-err.log", // PM2 level error logging
      out_file: "logs/pm2-out.log", // PM2 level output logging
      merge_logs: true,
      time: true
    }
  ]
};
