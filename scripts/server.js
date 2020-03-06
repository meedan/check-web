const app = require('./server-app'); // Express app
const port = process.env.SERVER_PORT || 8000;

console.log(`Starting server on port ${port}`);
app.listen(port);
