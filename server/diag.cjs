const mongoose = require('mongoose');

const MONGO_URI = "mongodb://hadia:Hadia222722@ac-u00jyyo-shard-00-00.3ujqdqh.mongodb.net:27017,ac-u00jyyo-shard-00-01.3ujqdqh.mongodb.net:27017,ac-u00jyyo-shard-00-02.3ujqdqh.mongodb.net:27017/campusconnect?ssl=true&replicaSet=atlas-jcjy60-shard-0&authSource=admin&retryWrites=true&w=majority";

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        const MentorBooking = mongoose.model('MentorBooking', new mongoose.Schema({}, { strict: false }), 'mentorbookings');
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

        const student = await User.findOne({ "profile.displayName": "test.student" });
        console.log("STUDENT_ID:", student?._id);

        const bookings = await MentorBooking.find({ menteeId: student?._id });
        console.log("BOOKING_COUNT:", bookings.length);
        bookings.forEach(b => {
            console.log(`BOOKING: ${b._id} | STATUS: ${b.status} | START: ${b.startAt}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
