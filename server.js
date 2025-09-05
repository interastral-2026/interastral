const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
const port = 3000;



app.use(bodyParser.json());

// دریافت داده از Stripe و ذخیره در Firestore
app.post('/save-subscription', async (req, res) => {
    try {
      console.log('Incoming request body:', req.body); // ← این خط مهمه
  
      const { email, plan, subscriptionId, status } = req.body;
  
  
      // ادامه کد شما برای ارسال به Firestore
      const token = await getAccessToken();
      const url = `https://firestore.googleapis.com/v1/projects/estelar-56583/databases/(default)/documents/subscriptions`;
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
  
      const text = await response.text();
      console.log('Firestore response:', text);
  
      res.status(response.status).send(text);
  
    } catch (error) {
      console.error('Server error details:', error.stack || error);
      res.status(500).json({ success: false, error: error.message, details: error.stack });
    }
  });
  