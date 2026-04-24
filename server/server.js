const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ════════════════════════════════════════
  🚀 Server is running!
  📡 Port: ${PORT}
  🌐 API: http://localhost:${PORT}/api
  💚 Health: http://localhost:${PORT}/health
  ════════════════════════════════════════
  `);
});