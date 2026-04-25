const app = require("./app");

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, HOST, () => {
  console.log(\?? Server running on http://\System.Management.Automation.Internal.Host.InternalHost:\\);
  console.log(\?? Health check: http://\System.Management.Automation.Internal.Host.InternalHost:\/health\);
});
