import express from 'express';
import Visa from '../models/VisaModel.js';
import { isAdmin, isAuth ,generateToken  } from '../utils.js';

const visarouter = express.Router();

// Create a new Visa
visarouter.post('/create', isAuth,isAdmin, async (req, res) => {
  try {
    const newVisa = new Visa(req.body);
    const savedVisa = await newVisa.save();
    res.status(201).json(savedVisa);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all Visas
visarouter.get('/allvisa', async (req, res) => {
  try {
    const visas = await Visa.find();
    res.json(visas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific Visa by ID
visarouter.get('/:id', async (req, res) => {
  try {
    const visa = await Visa.findById(req.params.id);
    if (visa) {
      res.json(visa);
    } else {
      res.status(404).json({ message: 'Visa not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a Visa
visarouter.put('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const visa = await Visa.findById(req.params.id);
    if (visa) {
      Object.assign(visa, req.body);
      const updatedVisa = await visa.save();
      res.json(updatedVisa);
    } else {
      res.status(404).json({ message: 'Visa not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a Visa
visarouter.delete('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const visaId = req.params.id;
    const visa = await Visa.findById(visaId);

    if (!visa) {
      return res.status(404).json({ message: 'Visa not found' });
    }

    await Visa.deleteOne({ _id: visaId });

    res.json({ message: 'Visa removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default visarouter;
