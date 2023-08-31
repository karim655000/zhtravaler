import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const buyVisaSchema = new Schema(
  {
    visa: { type: Schema.Types.ObjectId, ref: 'Visa', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nic: { type: Number },
    passport: { type: String },
    transactionId: { type: String },
    address: { type: String },
    approved: { type: Boolean, default: false }, // Set default value to false
  },
  { timestamps: true }
);

const BuyVisa = model('BuyVisa', buyVisaSchema);

export default BuyVisa;
