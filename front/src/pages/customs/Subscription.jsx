import React, { useState, useEffect } from "react";
import { Switch, Route, Link, useHistory } from "react-router-dom";
import Nav from "components/Nav";
import { basePath as apiBaseUrl } from "services/api";
import { stripePromise } from "services/stripe";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";

const basePath = "/customs/subscription";

const setCustomer = (obj) =>
  sessionStorage.setItem("customer", JSON.stringify(obj));
const getCustomer = () => JSON.parse(sessionStorage.getItem("customer"));
const removeCustomer = () => JSON.parse(sessionStorage.removeItem("customer"));

function Signup() {
  const [email, setEmail] = useState();
  const history = useHistory();

  const navigateToPrice = () => history.push(`${basePath}/prices`);

  useEffect(() => {
    const customer = getCustomer();
    if (customer) {
      navigateToPrice();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBaseUrl}/create-customer`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });
      const json = await response.json();
      console.log("json", json);
      setCustomer(json);
      navigateToPrice();
    } catch (error) {
      console.error(error);
      alert("Failed to Signup");
    }
  };

  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="xxxxx@example.com"
        />
        <button>Signup</button>
      </form>
      {/* <ul>
        <li>
          <Link to={`${basePath}/prices`}>Next</Link>
        </li>
      </ul> */}
    </div>
  );
}

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
  const [name, setName] = useState();
  const history = useHistory();

  const navigateToConfirmation = () => history.push(`${basePath}/confirmation`);

  const createSubscription = async ({
    customerId,
    paymentMethodId,
    priceId,
  }) => {
    const response = await fetch(`${apiBaseUrl}/create-subscription`, {
      method: "post",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        paymentMethodId,
        priceId,
      }),
    });
    const json = await response.json();
    if (json.error) {
      alert("Failed to Create Subscription");
      throw json;
    }
    return {
      paymentMethodId,
      priceId,
      subscription: json,
    };
  };

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();
    const customer = getCustomer();

    if (!stripe || !elements || !customer) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    try {
      const result = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
        billing_details: {
          name,
        },
      });

      if (result.error) {
        // Show error to your customer (e.g., insufficient funds)
        console.log(result.error.message);
      } else {
        // The payment has been processed!
        console.log("res", result);
        await createSubscription({
          customerId: customer.id,
          paymentMethodId: result.paymentMethod.id,
          priceId: "price_1IRnUUIoZNZEhIpWTyGIyhRf",
        });
        navigateToConfirmation();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Card Holder Name
        <div>
          <input
            type="text"
            value={name}
            placehodler="Name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </label>
      <label>
        Card details
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </label>
      <button disabled={!stripe}>Subscribe</button>
    </form>
  );
};

function DisplayPrice() {
  return (
    <div>
      <h1>Prices</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
      <ul>
        <li>
          <Link to={`${basePath}/`}>Back</Link>
        </li>
        <li>
          <Link to={`${basePath}/confirmation`}>Next</Link>
        </li>
      </ul>
    </div>
  );
}

function ConfirmationPage() {
  return (
    <div>
      <h1>Confirmation</h1>
      <ul>
        <li>
          <Link to={`${basePath}/checkout`}>Back</Link>
        </li>
      </ul>
    </div>
  );
}

function Index() {
  return (
    <div>
      <Nav />
      <h1>Custom Subscription</h1>
      <Switch>
        <Route path={`${basePath}/prices`}>
          <DisplayPrice />
        </Route>
        <Route path={`${basePath}/checkout`}>
          <CheckoutForm />
        </Route>
        <Route path={`${basePath}/confirmation`}>
          <ConfirmationPage />
        </Route>
        <Route exact path={`${basePath}/`}>
          <Signup />
        </Route>
      </Switch>
    </div>
  );
}

export default Index;
