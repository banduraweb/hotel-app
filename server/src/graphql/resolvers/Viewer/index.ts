import crypto from 'crypto'
import  {Response, Request} from 'express';
import {IResolvers} from 'apollo-server-express';
import {Viewer, Database, User} from '../../../lib/types';
import {Google} from '../../../lib/api';
import {LogInArgs} from './types';

const cookieOptions = {
	httpOnly: true,
	sameSite: true,
	signed: true,
	secure: process.env.NODE_ENV === "development" ? false : true,
};

const logInViaGoogle = async (
	code: string,
	token: string,
	db: Database,
	res: Response
): Promise<User | undefined>=>{
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

	res.cookie("viewer", userId, {
		...cookieOptions,
		maxAge: 365 * 24 * 60 * 60  * 1000
	});
	return viewer;
};


const logInViaCookies = async (
	token: string,
	db: Database,
	req: Request,
	res: Response):Promise<User | undefined>=>{
	const updateRes = await db.users.findOneAndUpdate(
		{ _id: req.signedCookies.viewer },
		{ $set: { token } },
		{ returnOriginal: false }
	);

	let viewer = updateRes.value;

	if (!viewer) {
		res.clearCookie("viewer", cookieOptions);
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
		logIn: async (
			_root: undefined,
			{input}: LogInArgs,
			{db, req, res}: {db: Database, req: Request, res: Response}
			):Promise<Viewer>=>{

			try {
				const code = input ? input.code : null;
				const token = crypto.randomBytes(16).toString('hex');

				const viewer: User | undefined = code
					? await logInViaGoogle(code, token, db, res)
					: await logInViaCookies(token, db, req, res);

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
		logOut: (_root: undefined, _args: {}, {res}: {res: Response}):Viewer=>{

			try {
				res.clearCookie("viewer", cookieOptions);
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