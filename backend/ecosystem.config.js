module.exports = {
  apps: [
    {
      name: "brevity_api_prod",
      cwd: "/root/brevity_api",
      script: "/root/brevity_api/.venv/bin/python",
      args: "-m uvicorn src.main:app --host 127.0.0.1 --port 2424",
      exec_mode: "fork", // keep 1 process; use 'cluster' with instances if you need
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      kill_timeout: 5000,
      env: {
        PYTHONUNBUFFERED: "1",
        ENV: "production",
      },
      error_file: "/root/.pm2/logs/brevity-api-prod-error.log",
      out_file: "/root/.pm2/logs/brevity-api-prod-out.log",
      merge_logs: true,
    },
    {
      name: "brevity_api_stage",
      cwd: "/root/brevity_api",
      script: "/root/brevity_api/.venv/bin/python",
      args: "-m uvicorn src.main:app --host 127.0.0.1 --port 2323 --reload",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: { PYTHONUNBUFFERED: "1", ENV: "staging" },
    },
  ],
};
