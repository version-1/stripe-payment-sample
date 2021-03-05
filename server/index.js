require('dotenv').config()

const stripe = require('stripe')(process.env.STRIPE_SECRET_TOKEN);
const express = require('express');
var cors = require('cors')


console.log('STRIPE_PUBLIC_TOKEN', process.env.STRIPE_PUBLIC_TOKEN)
console.log('STRIPE_SECRET_TOKEN', process.env.STRIPE_SECRET_TOKEN)

const app = express();

app.use(cors())
app.use(express.static('.'));
const YOUR_DOMAIN = 'http://localhost:4242';

app.post('/create-checkout-session', cors(), async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Stubborn Attachments',
            images: ['https://i.imgur.com/EHyR2nP.png'],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });
  res.json({ id: session.id });
});

app.listen(4242, () => console.log('Running on port 4242'));
