import type { INodeProperties } from 'n8n-workflow';
import { checkLocator } from '../../shared/descriptions';

const showFor = { resource: ['checkStatus'] };

export const checkStatusDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showFor },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a check status',
				description: 'Retrieve the current status of a single check',
				routing: { request: { method: 'GET', url: '=/v1/check-statuses/{{ $parameter.checkId }}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many check statuses',
				description: 'List the current status of many checks',
				routing: { request: { method: 'GET', url: '/v1/check-statuses' } },
			},
		],
		default: 'getAll',
	},

	checkLocator({ ...showFor, operation: ['get'] }, { inPath: true }),
];
