"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const graphql_1 = require("./graphql");
const database_1 = require("./database");
const cors_1 = __importDefault(require("cors"));
const app = express_1.default();
app.use(cors_1.default());
const port = process.env.PORT || 80;
((app) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield database_1.connectDataBase();
        const schema = apollo_server_express_1.makeExecutableSchema({ typeDefs: graphql_1.typeDefs, resolvers: graphql_1.resolvers });
        const server = new apollo_server_express_1.ApolloServer({ schema, context: () => ({ db }) });
        server.applyMiddleware({ app, path: '/api' });
        app.listen(port, () => {
            console.log(`[app]: localhost: ${port} started`);
        });
        // const listings = await db.listings.find({}).toArray();
        // console.log(listings);
    }
    catch (e) {
        console.log('server error');
        process.exit(1);
    }
}))(app);
//# sourceMappingURL=index.js.map