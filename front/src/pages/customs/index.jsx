import React, { useEffect, useState } from "react";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { stripePromise } from "services/stripe";
import Nav from "components/Nav";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const CheckoutForm = ({ secret }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements || !secret) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    try {
      const result = await stripe.confirmCardPayment(secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: "Jenny Rosen",
          },
        },
      });

      if (result.error) {
        // Show error to your customer (e.g., insufficient funds)
        console.log(result.error.message);
      } else {
        // The payment has been processed!
        if (result.paymentIntent.status === "succeeded") {
          // Show a success message to your customer
          // There's a risk of the customer closing the window before callback
          // execution. Set up a webhook or plugin to listen for the
          // payment_intent.succeeded event that handles any business critical
          // post-payment actions.
          console.log('succeeded')
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Card details
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </label>
      <button disabled={!stripe || !secret}>Confirm Order</button>
    </form>
  );
};

function Index() {
  const [secret, setSecret] = useState(undefined);

  useEffect(() => {
    const fetchSecret = async () => {
      const response = await fetch("http://localhost:4242/secret");
      let json = {};
      try {
        json = await response.json();
      } catch (e) {
        console.error(e);
      }
      setSecret(json.clientSecret);
      // Render the form to collect payment details, then
      // call stripe.confirmCardPayment() with the client secret.
    };
    fetchSecret();
  }, []);

  return (
    <div>
      <Nav />
      <h1>Custom</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm secret={secret} />
      </Elements>
    </div>
  );
}

export default Index;
