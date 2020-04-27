import _ from 'lodash.merge';
import {viewerResolvers} from "./Viewer"
import {userResolvers} from "./User"

export const resolvers = _(viewerResolvers, userResolvers);