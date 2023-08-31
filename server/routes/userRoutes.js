import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { isAuth, isAdmin, generateToken } from '../utils.js';
import multer from 'multer';

const userRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const updateUserProfile = async (user, updateData) => {
  if (updateData.name) user.name = updateData.name;
  if (updateData.email) user.email = updateData.email;
  if (updateData.contactnumber) user.contactnumber = updateData.contactnumber;
  if (updateData.picture) user.picture = updateData.picture;

  if (updateData.password) {
    user.password = bcrypt.hashSync(updateData.password, 8);
  }

  await user.save();
  
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    picture: user.picture,
    contactnumber:user.contactnumber,
    token: generateToken(user),
  };
};

userRouter.get(
  '/allusers',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

userRouter.put(
  '/profile',
  isAuth,
  upload.single('picture'),
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }

      const updateData = {
        name: req.body.name,
        email: req.body.email,
        picture: req.file ? req.file.buffer : undefined,
        password: req.body.password,
        contactnumber:req.body.contactnumber,
      };

      const updatedUser = await updateUserProfile(user, updateData);
      res.send(updatedUser);
    } catch (error) {
      res.status(500).send({ message: 'Error updating profile' });
    }
  })
);

userRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      updateUser(user, req, res);
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

userRouter.post(
  '/login',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        contactnumber: user.contactnumber,
        picture: user.picture, // Include the user's picture
        token: generateToken(user),
      });
    } else {
      res.status(401).send({ message: 'Invalid email or password' });
    }
  })
);

userRouter.post('/register', upload.single('picture'), expressAsyncHandler(async (req, res) => {
  const { name, email, password ,contactnumber} = req.body;
  const picture = req.file ? req.file.buffer : undefined;

  const hashedPassword = bcrypt.hashSync(password, 8);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    picture,
    contactnumber,
  });

  const user = await newUser.save();
  res.send({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    picture: user.picture,
    contactnumber:user.contactnumber,
    token: generateToken(user),
  });
}));

// ... (your existing code)

userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id });

      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }

      if (user.isAdmin) {
        return res.status(400).send({ message: 'Cannot delete an admin user' });
      }

      await User.deleteOne({ _id: req.params.id }); 
      res.send({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).send({ message: 'Error deleting user' });
    }
  })
);




export default userRouter;
