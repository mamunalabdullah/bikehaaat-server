const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())

app.get('/', (req, res) => {
  res.send("hello mamun, whats up..............");
})

app.listen(port, () => {
  console.log("Listening to port", port);
})