import React, { useState } from 'react';
import {gql} from 'apollo-boost'
import { useQuery, useMutation} from 'react-apollo';
import { Listings as ListingsData, Listings_listings } from './__generated__/Listings';
import { DeleteListings as DeleteListingsData, DeleteListingsVariables } from './__generated__/DeleteListings';
import { ListingsSkeleton, ListingModalInfo } from './components';
import { List, Avatar, Button, Spin, Alert } from 'antd';
import {
  DeleteOutlined
} from '@ant-design/icons';
import './styles/Listings.scss';

const LISTINGS = gql`
  query Listings {
    listings {
      id
      title
      image
      address
      price
      numOfGuests
      numOfBeds
      numOfBaths
      rating
    }
  }
`;

const DELETE_LISTING = gql`
  mutation DeleteListings($id: ID!) {
    deleteListings(id: $id) {
      id
    }
  }
`;


interface State {
  visible: boolean;
  additionalInfo: Listings_listings;
}


export const Listings = () => {


  const [modal, setMoreInfo] = useState<State>({
    visible: false,
    additionalInfo: {
      id: '',
      title: '',
      image: '',
      address: '',
      price: 0,
      numOfGuests: 0,
      numOfBeds: 0,
      numOfBaths: 0,
      rating: 0,
      __typename: "Listing"
    }
  });


  const { data, loading, refetch, error } = useQuery<ListingsData>(LISTINGS);
  const [deleteListings,
    { loading: deleteLoading, error: deleteError }
  ] = useMutation<DeleteListingsData, DeleteListingsVariables>(DELETE_LISTING);

  const handleDeleteListings = async (id: string) => {
    await deleteListings({ variables: { id } });
    refetch();
  };

  const handleShowMoreInfo = (hotel: Listings_listings) => {
    setMoreInfo({
      visible: true,
      additionalInfo: hotel
    });
  };

  const closeModal = () => {
    setMoreInfo({
      visible: false,
      additionalInfo: {
        id: '',
        title: '',
        image: '',
        address: '',
        price: 0,
        numOfGuests: 0,
        numOfBeds: 0,
        numOfBaths: 0,
        rating: 0,
        __typename: "Listing"
      }
    });
  };


  const listings = data ? data.listings : null;
  const listingsList = listings ? (
  <List itemLayout="horizontal"
        dataSource={listings}
        renderItem={listing => (
          <List.Item actions={[<Button
            onClick={() => handleShowMoreInfo(listing)}
            type="primary">More info
          </Button>,
            <Button
              type="danger"
              onClick={() => handleDeleteListings(listing.id)}>
              <DeleteOutlined/>
            </Button>]}>
            <List.Item.Meta
              title={listing.title}
              description={listing.address}
              avatar={<Avatar src={listing.image} shape="square" size={64}/>}
            />
          </List.Item>
        )}

  />
) : null;


  if (loading) {
    return (
      <div className="listings">
        <ListingsSkeleton title="Fetching Hotel list..."/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="listings">
        <ListingsSkeleton title="Fetching Hotel list..." error/>
      </div>
    );

  }

  const alertError = deleteError ? (
    <Alert type='error'
           message="Uh oh! Something went wrong - please try again later :("/>
  ) : null;


  return (
   <div className="listings">
     <Spin spinning={deleteLoading}>
       <h2>Hotel list</h2>
       {alertError}
     {listingsList}
       <ListingModalInfo modal={modal} closeModal={closeModal}/>

     </Spin>
    </div>
   )
};