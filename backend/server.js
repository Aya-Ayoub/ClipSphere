const http = require("http");
const app = require("./src/app");
const { initSocket } = require("./src/config/socket");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// Create an HTTP server from the Express app so Socket.io can share it
const server = http.createServer(app);

// Attach Socket.io to the HTTP server
initSocket(server);

// Use server.listen (not app.listen) so Socket.io works
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});