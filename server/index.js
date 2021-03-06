require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_TOKEN);
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(morgan("combined"));

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(jsonParser);
app.use(urlencodedParser);

app.use(express.static("."));
const YOUR_DOMAIN = "http://localhost:4242";

app.get("/secret", async (req, res) => {
  const intent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: "usd",
    // Verify your integration in this guide by including this parameter
    metadata: { integration_check: "accept_a_payment" },
  });

  console.log("intent", intent);

  res.json({ clientSecret: intent.client_secret });
});

app.post("/create-checkout-session", cors(), async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Stubborn Attachments",
            images: ["https://i.imgur.com/EHyR2nP.png"],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });
  res.json({ id: session.id });
});

// subscription
app.post("/create-customer", cors(), async (req, res) => {
  const { email } = req.body;

  const customer = await stripe.customers.create({
    email,
    description: "My First Test Customer (created for API docs)",
  });

  res.json(customer);
});

app.post("/create-subscription", async (req, res) => {
  // Attach the payment method to the customer
  try {
    await stripe.paymentMethods.attach(req.body.paymentMethodId, {
      customer: req.body.customerId,
    });
  } catch (error) {
    return res.status("402").send({ error: { message: error.message } });
  }

  // Change the default invoice settings on the customer to the new payment method
  try {
    await stripe.customers.update(req.body.customerId, {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    });
  } catch (e) {
    console.log(e);
  }

  // Create the subscription
  try {
    const subscription = await stripe.subscriptions.create({
      customer: req.body.customerId,
      items: [{ price: req.body.priceId }],
      expand: ["latest_invoice.payment_intent"],
    });
    res.json(subscription);
  } catch (e) {
    console.log(e);
  }
});

app.listen(4242, () => console.log("Running on port 4242"));
