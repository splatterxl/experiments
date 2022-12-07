import { Stripe } from 'stripe';

export const stripe: Stripe = require('stripe')(process.env.STRIPE_KEY);
