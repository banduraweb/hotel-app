require('dotenv').config();
import express,{Application} from 'express';
import {ApolloServer, makeExecutableSchema} from 'apollo-server-express';
import {typeDefs, resolvers} from './graphql';
import {connectDataBase} from './database'
import cors from 'cors';

const app = express();
app.use(cors());

const port = process.env.PORT || 80;

(async (app:Application)=>{

	try	{
		const db = await connectDataBase();
		const schema = makeExecutableSchema({ typeDefs, resolvers });
		const server = new ApolloServer({schema, context: () => ({ db })});
		server.applyMiddleware({app, path: '/api'});

		app.listen(port, ()=>{
			console.log(`[app]: localhost: ${port} started`);
		});

		// const listings = await db.listings.find({}).toArray();
		// console.log(listings);

	} catch (e) {

		console.log('server error');
		process.exit(1);
	}
})(app);