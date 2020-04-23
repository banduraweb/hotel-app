import { IResolvers } from 'apollo-server-express';
import { Database, Listings } from '../../../lib/types'
import { ObjectId } from 'mongodb';

export const listingResolver: IResolvers = {

	Query: {
		listings: async (_root: undefined, _args: {}, { db }: {db : Database}):Promise<Listings[]> => {
			return await db.listings.find({}).toArray();
		}
	},

	Mutation: {
		deleteListings: async (_root: undefined, { id }: { id: string }, { db }: {db : Database}):Promise<Listings> => {
			try {
				const deletedItem =	await db.listings.findOneAndDelete({_id: new ObjectId(id)});
				if (!deletedItem.value) {
					throw new Error('not found item');
				}
				return deletedItem.value;
			} catch (e) {
				throw new Error('failed to delete');
			}
		}
	},
	Listing: {
		id: (listing: Listings): string => listing._id.toString()
	}
};