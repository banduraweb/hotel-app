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
const crypto_1 = __importDefault(require("crypto"));
const api_1 = require("../../../lib/api");
const cookieOptions = {
    httpOnly: true,
    sameSite: true,
    signed: true,
    secure: process.env.NODE_ENV === "development" ? false : true,
};
const logInViaGoogle = (code, token, db, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { user } = yield api_1.Google.logIn(code);
    if (!user) {
        throw new Error('Google login error');
    }
    const userNamesList = ((_a = user.names) === null || _a === void 0 ? void 0 : _a.length) ? user.names : null;
    const userPhotoList = ((_b = user.photos) === null || _b === void 0 ? void 0 : _b.length) ? user.photos : null;
    const userEmailList = ((_c = user.emailAddresses) === null || _c === void 0 ? void 0 : _c.length) ? user.emailAddresses : null;
    const userName = userNamesList ? userNamesList[0].displayName : null;
    const userId = ((_d = userNamesList === null || userNamesList === void 0 ? void 0 : userNamesList[0].metadata) === null || _d === void 0 ? void 0 : _d.source) ? userNamesList[0].metadata.source.id : null;
    const userAvatar = (userPhotoList === null || userPhotoList === void 0 ? void 0 : userPhotoList[0].url) ? userPhotoList[0].url : null;
    const userEmail = (userEmailList === null || userEmailList === void 0 ? void 0 : userEmailList[0].value) ? userEmailList[0].value : null;
    if (!userName || !userId || !userAvatar || !userEmail) {
        throw new Error(`Google login error`);
    }
    const updateRes = yield db.users.findOneAndUpdate({ _id: userId }, { $set: { name: userName, avatar: userAvatar, contact: userEmail, token } }, { returnOriginal: false });
    let viewer = updateRes.value;
    if (!viewer) {
        const insertResult = yield db.users.insertOne({
            _id: userId,
            token,
            name: userName,
            avatar: userAvatar,
            contact: userEmail,
            income: 0,
            bookings: [],
            listings: []
        });
        viewer = insertResult.ops[0];
    }
    res.cookie("viewer", userId, Object.assign(Object.assign({}, cookieOptions), { maxAge: 365 * 24 * 60 * 60 * 1000 }));
    return viewer;
});
const logInViaCookies = (token, db, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updateRes = yield db.users.findOneAndUpdate({ _id: req.signedCookies.viewer }, { $set: { token } }, { returnOriginal: false });
    let viewer = updateRes.value;
    if (!viewer) {
        res.clearCookie("viewer", cookieOptions);
    }
    return viewer;
});
exports.viewerResolvers = {
    Query: {
        authUrl: () => {
            try {
                return api_1.Google.authUrl;
            }
            catch (e) {
                throw new Error(`Failed to query Google Auth Url: ${e}`);
            }
        }
    },
    Mutation: {
        logIn: (_root, { input }, { db, req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const code = input ? input.code : null;
                const token = crypto_1.default.randomBytes(16).toString('hex');
                const viewer = code
                    ? yield logInViaGoogle(code, token, db, res)
                    : yield logInViaCookies(token, db, req, res);
                if (!viewer) {
                    return { didRequest: true };
                }
                return {
                    _id: viewer._id,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    walletId: viewer.walletId,
                    didRequest: true
                };
            }
            catch (e) {
                throw new Error(`Failed to logIn: ${e}`);
            }
        }),
        logOut: (_root, _args, { res }) => {
            try {
                res.clearCookie("viewer", cookieOptions);
                return { didRequest: true };
            }
            catch (e) {
                throw new Error(`Failed to logOut: ${e}`);
            }
        }
    },
    Viewer: {
        id: (viewer) => { return viewer._id; },
        hasWallet: (viewer) => {
            return viewer.walletId ? true : undefined;
        }
    }
};
//# sourceMappingURL=index.js.map