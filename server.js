const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const keys = require('./service-account.json'); // فایل JSON سرویس اکانت

app.use(bodyParser.json());

async function getAccessToken() {
  const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform']
  );
  await client.authorize();
  return client.credentials.access_token;
}

app.post('/save-subscription', async (req, res) => {
  const { email, plan, subscriptionId, status } = req.body;
  const token = await getAccessToken();

  // ارسال به Firestore
  const fetch = require('node-fetch');
  const url = `https://firestore.googleapis.com/v1/projects/${keys.project_id}/databases/(default)/documents/subscriptions`;
  const body = {
    fields: {
      email: { stringValue: email },
      plan: { stringValue: plan },
      subscriptionId: { stringValue: subscriptionId },
      status: { stringValue: status },
      startDate: { stringValue: new Date().toISOString() }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  res.json({ success: true, data });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
