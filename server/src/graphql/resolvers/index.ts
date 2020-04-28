import _ from 'lodash.merge';
import {viewerResolvers} from "./Viewer"
import {userResolvers} from "./User"
import {listingResolvers} from "./Listing"
import {bookingResolvers} from "./Booking"

export const resolvers = _(viewerResolvers, userResolvers, listingResolvers, bookingResolvers);