const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Class = require('./models/Class');
const School = require('./models/School');

dotenv.config();

const seedClasses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get the first school or create one
        let school = await School.findOne();
        if (!school) {
            console.log('No school found. Please create a school first.');
            process.exit(1);
        }

        const standardClasses = [
            { name: 'Play Group', section: 'A' },
            { name: 'Nursery', section: 'A' },
            { name: 'KG', section: 'A' },
            { name: '1st', section: 'A' },
            { name: '2nd', section: 'A' },
            { name: '3rd', section: 'A' },
            { name: '4th', section: 'A' },
            { name: '5th', section: 'A' },
            { name: '6th', section: 'A' },
            { name: '7th', section: 'A' },
            { name: '8th', section: 'A' },
            { name: '9th', section: 'A' },
            { name: '10th', section: 'A' },
        ];

        for (const cls of standardClasses) {
            const existing = await Class.findOne({ 
                name: cls.name, 
                section: cls.section, 
                schoolId: school._id 
            });

            if (!existing) {
                await Class.create({
                    name: cls.name,
                    section: cls.section,
                    schoolId: school._id
                });
                console.log(`✓ Created class: ${cls.name} - ${cls.section}`);
            } else {
                console.log(`✗ Class already exists: ${cls.name} - ${cls.section}`);
            }
        }

        console.log('\nClasses seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedClasses();
