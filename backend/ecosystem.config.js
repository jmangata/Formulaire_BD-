module.exports = {
    apps : [
      {
      name: 'formulaire-dsi-bds',
      script: './index.js',
  
      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: '1G',
      error_file: '/var/log/node/app-err.log',   // Here is where you specify the error log location
      out_file: '/var/log/node/app-out.log',    // Here is where you specify the output log location
      log_date_format: 'YYYY-MM-DD HH:mm Z', // Optional: Add timestamps to each log entry
      merge_logs: true,  // Merges all instances logs into a single log file per type (out/error)
      env: {
        NODE_ENV: 'production'
      }
    },
  ]
  };
