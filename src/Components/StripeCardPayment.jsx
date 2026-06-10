import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = forwardRef(({ billingDetails }, ref) => {
  const stripe = useStripe();
  const elements = useElements();

  useImperativeHandle(ref, () => ({
    async confirmPayment() {
      if (!stripe || !elements) {
        throw new Error('Payment form is still loading. Please wait a moment.');
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: billingDetails.name,
              email: billingDetails.email,
              phone: billingDetails.phone,
              address: {
                line1: billingDetails.address,
                city: billingDetails.city,
                postal_code: billingDetails.zipCode,
                country: 'PK',
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message || 'Card payment failed');
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        throw new Error('Payment was not completed. Please try again.');
      }

      return paymentIntent;
    },
  }));

  return (
    <div className="stripe-payment-element-wrap">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />
    </div>
  );
});

PaymentForm.displayName = 'PaymentForm';

const StripeCardPayment = forwardRef(({ publishableKey, clientSecret, billingDetails }, ref) => {
  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  if (!stripePromise || !clientSecret) {
    return (
      <div className="stripe-payment-loading">
        Preparing secure card payment...
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#e21b26',
            colorText: '#1a1a1a',
            colorBackground: '#ffffff',
            borderRadius: '6px',
          },
        },
      }}
    >
      <PaymentForm ref={ref} billingDetails={billingDetails} />
    </Elements>
  );
});

StripeCardPayment.displayName = 'StripeCardPayment';

export default StripeCardPayment;
