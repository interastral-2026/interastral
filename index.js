const admin = require('firebase-admin');

admin.initializeApp(); // Cloud Function خودش auth رو مدیریت می‌کنه

const db = admin.firestore();

exports.stripeWebhook = async (req, res) => {
  try {
    const event = req.body;

    const email = event.data.object.customer_email;
    const subscriptionId = event.data.object.subscription;
    const plan = event.data.object.items.data[0].price.id;
    const status = event.type === 'invoice.payment_succeeded' ? 'paid' : 'pending';

    await db.collection('subscriptions').doc(subscriptionId).set({
      email,
      subscriptionId,
      plan,
      status,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
};
