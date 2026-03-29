const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const users = await mongoose.connection.db.collection('users').find({ email: 'test.student@campusconnect.com' }).toArray();
    if (users.length > 0) {
      console.log("Student User:", JSON.stringify({
        email: users[0].email,
        campusId: users[0].campusId,
        roles: users[0].roles
      }, null, 2));
    } else {
      console.log("Student User not found");
    }

    const events = await mongoose.connection.db.collection('events').find({}).toArray();
    console.log("Total Events in DB:", events.length);
    events.forEach(e => {
        console.log(`- Event: "${e.title}", campusId: ${e.campusId}, isOnlineCompetition: ${e.isOnlineCompetition}, status: ${e.status}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
