import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactnumber: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    picture: { type: Buffer }, // Store the image directly as binary data
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
