const app = require('./api');

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Webhook receiver listening on http://localhost:${port}`);
});
