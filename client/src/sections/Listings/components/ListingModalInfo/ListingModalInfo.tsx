import React from 'react';
import { Avatar, List, Modal } from 'antd';
import './style/index.scss';
import { Listings_listings } from '../../__generated__/Listings';


interface IModal {
	visible: boolean;
	additionalInfo: Listings_listings;
}

interface IProps {
	modal: IModal;
	closeModal: () => void
}

export const ListingModalInfo = ({ modal, closeModal }: IProps) => {

	const { additionalInfo } = modal;

	return (
		<Modal
			title={additionalInfo.title}
			centered
			visible={modal.visible}
			onOk={() => closeModal()}
			onCancel={() => closeModal()}
			footer={null}

		>
			<List.Item>
				<List.Item.Meta
					title={additionalInfo.title}
					description={additionalInfo.address}
					avatar={<Avatar src={additionalInfo.image} shape="square" size={130}/>}
				/>


			</List.Item>

			<h5>numOfBeds : {additionalInfo.numOfBeds}</h5>
			<h5>rating : {additionalInfo.rating}</h5>
			<h5>price: {additionalInfo.price}</h5>

		</Modal>
	);
};