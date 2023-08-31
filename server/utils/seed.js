import bcrypt from 'bcryptjs';
import User from '../Models/userModel.js';

const data = {
  users: [
    {
      name: 'Abdullah',
      email: 'abdullah.shah7839@gmail.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: true,
    },
    {
      name: 'Sami',
      email: 'sami@gmail.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: false,
    },
  ],
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();

    // Insert new data
    const createdUsers = await User.insertMany(data.users);

    console.log('Data seeded successfully:', createdUsers);
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

export default seedData;
