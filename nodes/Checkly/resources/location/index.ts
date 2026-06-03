import type { INodeProperties } from 'n8n-workflow';

const showFor = { resource: ['location'] };

export const locationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showFor },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many locations',
				description: 'List many available public checking locations',
				routing: { request: { method: 'GET', url: '/v1/locations' } },
			},
		],
		default: 'getAll',
	},
];
