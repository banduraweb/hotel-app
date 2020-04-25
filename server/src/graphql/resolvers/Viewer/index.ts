import crypto from 'crypto'
import {IResolvers} from 'apollo-server-express';
import {Viewer, Database, User} from '../../../lib/types';
import {Google} from '../../../lib/api';
import {LogInArgs} from './types';


const logInViaGoogle = async (code: string, token: string, db: Database): Promise<User | undefined>=>{
	const {user} = await Google.logIn(code);

	if (!user) {
		throw new Error('Google login error')
	}


	const userNamesList = user.names?.length ? user.names: null;
	const userPhotoList = user.photos?.length ? user.photos: null;
	const userEmailList = user.emailAddresses?.length ? user.emailAddresses: null;

	const userName = userNamesList ? userNamesList[0].displayName : null;
	const userId = userNamesList?.[0].metadata?.source ? userNamesList[0].metadata.source.id : null;
	const userAvatar = userPhotoList?.[0].url ? userPhotoList[0].url : null;
	const userEmail = userEmailList?.[0].value ? userEmailList[0].value : null;

	if (!userName || !userId || !userAvatar || !userEmail) {
		throw new Error(`Google login error`)
	}


	const updateRes = await db.users.findOneAndUpdate(
		{ _id: userId },
		{$set: {name: userName, avatar: userAvatar, contact: userEmail, token}},
		{returnOriginal: false}
		);
	let viewer = updateRes.value;

	if (!viewer) {
		const insertResult = await db.users.insertOne({
			_id: userId,
		token,
		name: userName,
		avatar: userAvatar,
		contact: userEmail,
		income: 0,
		bookings: [],
		listings: []
		});
		viewer = insertResult.ops[0]
	}
	return viewer;
};

export const viewerResolvers: IResolvers = {
	Query: {
		authUrl: (): string =>{
		  try {
				return Google.authUrl;
			} catch (e) {
				throw new Error(`Failed to query Google Auth Url: ${e}`)
			}
		}
	},
	Mutation: {
		logIn: async (_root: undefined, {input}: LogInArgs, {db}: {db: Database}):Promise<Viewer>=>{

			try {
				const code = input ? input.code : null;
				const token = crypto.randomBytes(16).toString('hex');

				const viewer: User | undefined = code ? await logInViaGoogle(code, token, db): undefined;

				if (!viewer) {
					return {didRequest: true}
				}

				return {
					_id: viewer._id,
					token: viewer.token,
					avatar: viewer.avatar,
					walletId: viewer.walletId,
					didRequest: true
				}
			}catch (e) {
				throw new Error(`Failed to logIn: ${e}`)
			}

		},
		logOut: ():Viewer=>{

			try {
				return {	didRequest: true}
			} catch (e) {
				throw new Error(`Failed to logOut: ${e}`)
			}

		}
	},
	
	Viewer: {
		id: (viewer: Viewer): string | undefined => {return viewer._id },
		hasWallet: (viewer: Viewer): boolean | undefined => {
			return viewer.walletId ? true : undefined;
		}
	}

};