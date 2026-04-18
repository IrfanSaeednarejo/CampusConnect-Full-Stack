import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Campus } from '../src/models/campus.model.js';

dotenv.config({ path: './.env' });

const campuses = [
  {
    name: "FAST NUCES - Karachi",
    type: "main",
    location: {
      city: "Karachi",
      country: "Pakistan",
      address: "ST-4, Sector 17-D, Shahrah-e-Faisal"
    },
    code: "FAST-KHI",
    status: "active"
  },
  {
    name: "IBA Karachi",
    type: "main",
    location: {
      city: "Karachi",
      country: "Pakistan",
      address: "University Road"
    },
    code: "IBA-KHI",
    status: "active"
  },
  {
    name: "LUMS",
    type: "main",
    location: {
      city: "Lahore",
      country: "Pakistan",
      address: "DHA Phase 5"
    },
    code: "LUMS-LHR",
    status: "active"
  },
  {
    name: "Sukkur IBA University",
    type: "main",
    location: {
      city: "Sukkur",
      country: "Pakistan",
      address: "Airport Road Sukkur"
    },
    code: "SIBA-SUK",
    status: "active"
  }
];

const seedCampuses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const campusData of campuses) {
      const exists = await Campus.findOne({ name: campusData.name });
      if (!exists) {
        await Campus.create(campusData);
        console.log(`Created campus: ${campusData.name}`);
      } else {
        console.log(`Campus already exists: ${campusData.name}`);
      }
    }

    console.log("Seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedCampuses();
