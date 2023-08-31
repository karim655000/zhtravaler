import express from 'express';
import Visa from '../models/VisaModel.js';
import BuyVisa from '../models/BuyVisaModel.js';
import stripe from 'stripe';
import { isAdmin, isAuth } from '../utils.js';

const buyVisaRouter = express.Router();
const stripeSecretKey = 'sk_test_51Niv3RKIe3vjovrp8ZNc8Qy35oCDgCCgPilq9ykjLhR7GkFeIy9P1FKD8h5bKCpYJelvGEpPLLnGOsNVfwU2axzv00d6GY3qAt';
const stripeClient = new stripe(stripeSecretKey);

buyVisaRouter.post('/create-checkout-session/:visaId',  async (req, res) => {
  try {
    const { visaId } = req.params;
    const { user, nic, passport, address, token } = req.body;

    // Fetch the selected visa from the database
    const visa = await Visa.findById(visaId);
    if (!visa) {
      return res.status(404).json({ message: 'Visa not found' });
    }

    // Create a new BuyVisa entry
    const newBuyVisa = new BuyVisa({
      visa: visaId,
      user,
      nic,
      passport,
      address,
    });

    // Save the BuyVisa entry to the database
    const savedBuyVisa = await newBuyVisa.save();

    // Create a PaymentMethod using the token
    const paymentMethod = await stripeClient.paymentMethods.create({
      type: 'card',
      card: {
        token: token,
      },
    });

    // Handle Stripe payment and update transactionId
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: visa.price * 100,
      currency: 'usd',
      description: `Payment for visa: ${visa.name}`,
      payment_method: paymentMethod.id,
      confirm: true,
      return_url: 'https://your-website.com/success', // Specify your success redirect URL
      metadata: {
        visaName: visa.name,
        visaType: visa.type,
        visaCountry: visa.country,
      },
    });

    savedBuyVisa.transactionId = paymentIntent.id;
    await savedBuyVisa.save();

    // Create a Stripe Checkout session for payment
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd', // Replace with your desired currency
            product_data: {
              name: visa.name,
              images: [visa.image], // Assuming you have image URLs for products
            },
            unit_amount: visa.price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://your-website.com/success?buyvisaId=${savedBuyVisa._id}`, // Pass BuyVisa ID as a query parameter
      cancel_url: 'https://your-website.com/cancel', // Replace with your cancel URL
     
    });

    res.status(201).json({
      sessionId: session.id,
      newBuyVisa: savedBuyVisa,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


buyVisaRouter.get('/my-buy-visas/:userId', isAuth, async (req, res) => {
  try {
    const { userId } = req.params; 
    const userBuyVisas = await BuyVisa.find({ user: userId })
      .populate('visa')
      .populate('user', 'name email contactnumber');
    res.status(200).json(userBuyVisas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


buyVisaRouter.get('/all-buy-visas', isAuth, isAdmin, async (req, res) => {
  try {
    const allBuyVisas = await BuyVisa.find()
      .populate('visa')
      .populate('user', 'name email');
    res.status(200).json(allBuyVisas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

buyVisaRouter.put('/approve-buy-visa/:buyVisaId', isAuth, isAdmin, async (req, res) => {
  try {
    const { buyVisaId } = req.params;

    const buyVisa = await BuyVisa.findById(buyVisaId);
    if (!buyVisa) {
      return res.status(404).json({ message: 'Buy Visa record not found' });
    }

    buyVisa.approved = true; // Set the 'approved' field to true
    await buyVisa.save();

    res.status(200).json({ message: 'Buy Visa record approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






export default buyVisaRouter;

