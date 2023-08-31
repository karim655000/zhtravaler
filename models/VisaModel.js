import mongoose from 'mongoose';

const visaSchema = new mongoose.Schema({
  name: String,
  type: String,
  image:String ,
  country: String,
  price: Number,
  description: String,
  duration: String,
  ticketStatus: String,
  salary: Number,
  timestamp: { type: Date, default: Date.now }
});

const Visa = mongoose.model('Visa', visaSchema);

export default Visa;
