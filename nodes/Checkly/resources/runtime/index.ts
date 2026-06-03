import type { INodeProperties } from 'n8n-workflow';

const showFor = { resource: ['runtime'] };

export const runtimeDescription: INodeProperties[] = [
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
				action: 'Get a runtime',
				description: 'Retrieve a single runtime by ID',
				routing: { request: { method: 'GET', url: '=/v1/runtimes/{{ $parameter.runtimeId }}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many runtimes',
				description: 'List many available runtimes',
				routing: { request: { method: 'GET', url: '/v1/runtimes' } },
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Runtime ID',
		name: 'runtimeId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...showFor, operation: ['get'] } },
		placeholder: 'e.g. 2024.02',
		description: 'The ID of the runtime',
	},
];
