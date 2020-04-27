require('dotenv').config();
import express,{Application} from 'express';
import cookieParser from 'cookie-parser';
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
		console.log("db connected");
		app.use(cookieParser(process.env.SERCET));
		const schema = makeExecutableSchema({ typeDefs, resolvers });
		const server = new ApolloServer({
			schema, context: ({req, res}) => ({ db, req, res })
		});
		server.applyMiddleware({app, path: '/api'});

		app.listen(port, ()=>{
			console.log(`[app]: localhost: ${port} started`);
		});

	} catch (e) {

		console.log('server error');
		process.exit(1);
	}
})(app);