import type { INodeProperties } from 'n8n-workflow';
import { additionalBodyJsonField, checkGroupLocator, limitField, pageOption } from '../../shared/descriptions';
import { mergeAdditionalJson } from '../../shared/preSend';

const showFor = { resource: ['checkGroup'] };
const showCreateUpdate = { ...showFor, operation: ['create', 'update'] };

export const checkGroupDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showFor },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a check group',
				description: 'Create a new check group',
				routing: {
					send: { preSend: [mergeAdditionalJson] },
					request: { method: 'POST', url: '/v1/check-groups' },
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a check group',
				description: 'Delete a check group',
				routing: { request: { method: 'DELETE', url: '=/v1/check-groups/{{ $parameter.groupId }}' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a check group',
				description: 'Retrieve a single check group by ID',
				routing: { request: { method: 'GET', url: '=/v1/check-groups/{{ $parameter.groupId }}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many check groups',
				description: 'List check groups in the account',
				routing: { request: { method: 'GET', url: '/v1/check-groups' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a check group',
				description: 'Update an existing check group',
				routing: {
					send: { preSend: [mergeAdditionalJson] },
					request: { method: 'PUT', url: '=/v1/check-groups/{{ $parameter.groupId }}' },
				},
			},
		],
		default: 'getAll',
	},

	checkGroupLocator({ ...showFor, operation: ['get', 'delete', 'update'] }, { inPath: true }),

	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...showFor, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'name', value: '={{ $value }}' } },
		description: 'A human-readable name for the check group',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showCreateUpdate },
		options: [
			{
				displayName: 'Activated',
				name: 'activated',
				type: 'boolean',
				default: true,
				routing: { send: { type: 'body', property: 'activated', value: '={{ $value }}' } },
				description: 'Whether checks in the group run on their schedule',
			},
			{
				displayName: 'Concurrency',
				name: 'concurrency',
				type: 'number',
				default: 3,
				routing: { send: { type: 'body', property: 'concurrency', value: '={{ $value }}' } },
				description: 'Number of checks that run concurrently within the group',
			},
			{
				displayName: 'Locations',
				name: 'locations',
				type: 'string',
				default: '',
				placeholder: 'us-east-1,eu-west-1',
				routing: {
					send: {
						type: 'body',
						property: 'locations',
						value: '={{ $value.split(",").map(item => item.trim()).filter(item => item) }}',
					},
				},
				description: 'Comma-separated location codes the group runs from',
			},
			{
				displayName: 'Muted',
				name: 'muted',
				type: 'boolean',
				default: false,
				routing: { send: { type: 'body', property: 'muted', value: '={{ $value }}' } },
				description: 'Whether alert notifications are muted for the group',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				displayOptions: { show: { '/operation': ['update'] } },
				routing: { send: { type: 'body', property: 'name', value: '={{ $value }}' } },
				description: 'A new name for the check group',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				placeholder: 'production,api',
				routing: {
					send: {
						type: 'body',
						property: 'tags',
						value: '={{ $value.split(",").map(item => item.trim()).filter(item => item) }}',
					},
				},
				description: 'Comma-separated tags to attach to the group',
			},
		],
	},
	additionalBodyJsonField(showCreateUpdate),

	limitField({ ...showFor, operation: ['getAll'] }),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { ...showFor, operation: ['getAll'] } },
		options: [pageOption],
	},
];
