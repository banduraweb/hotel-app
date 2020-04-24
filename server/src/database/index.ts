import {MongoClient} from 'mongodb';
import {Database, User, Listing, Booking} from '../lib/types'

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/test?retryWrites=true&w=majority`;

export const connectDataBase = async ():Promise<Database> =>{

	const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  });
	const db = client.db('main');
	return {
		bookings: db.collection<Booking>("bookings"),
		listings: db.collection<Listing>('listings'),
		users: db.collection<User>("users")
	}
};
