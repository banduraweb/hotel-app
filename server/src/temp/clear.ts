require('dotenv').config();

import {connectDataBase} from '../database'




(async ()=>{
	try {
		console.log('[clear] running...');
		const db = await connectDataBase();

		const bookings = await db.bookings.find({}).toArray();
		const listings = await db.listings.find({}).toArray();
		const users = await db.users.find({}).toArray();


		bookings.length > 0 && await db.bookings.drop();
		listings.length > 0 && await db.listings.drop();
		users.length > 0 && await db.users.drop();



		console.log('[clear] success!');
	} catch  {
		throw new Error('failed to clear database')
	}
})();