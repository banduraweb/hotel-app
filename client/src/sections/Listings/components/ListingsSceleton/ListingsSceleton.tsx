import React from 'react';
import { Skeleton, Divider, Alert } from 'antd';
import './styles/ListingSceleton.scss'


interface Props {
	title: string;
	error?: boolean;
}


export const ListingsSkeleton = ({ title, error }: Props) => {

	const alertError = error ? (
		<Alert type='error'
					 message="Uh oh! Something went wrong - please try again later :("/>
	) : null;

	const skeleton: JSX.Element[] = [...Array(4).keys()].map(item => (
		<div key={item} className="listings__skeleton">
			<Skeleton active paragraph={{ rows: 1 }}/>
			<Divider/>
		</div>
	));

	return <>
		{alertError}
		<h2>{title}</h2>
		{skeleton}
	</>;
};
