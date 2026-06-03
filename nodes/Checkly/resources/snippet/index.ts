import type { INodeProperties } from 'n8n-workflow';
import { limitField, pageOption } from '../../shared/descriptions';

const showFor = { resource: ['snippet'] };
const showCreateUpdate = { ...showFor, operation: ['create', 'update'] };

const snippetIdField: INodeProperties = {
	displayName: 'Snippet ID',
	name: 'snippetId',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { ...showFor, operation: ['get', 'update', 'delete'] } },
	description: 'The ID of the snippet',
};

export const snippetDescription: INodeProperties[] = [
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
				action: 'Create a snippet',
				description: 'Create a new snippet',
				routing: { request: { method: 'POST', url: '/v1/snippets' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a snippet',
				description: 'Delete a snippet',
				routing: { request: { method: 'DELETE', url: '=/v1/snippets/{{ $parameter.snippetId }}' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a snippet',
				description: 'Retrieve a single snippet by ID',
				routing: { request: { method: 'GET', url: '=/v1/snippets/{{ $parameter.snippetId }}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many snippets',
				description: 'List snippets in the account',
				routing: { request: { method: 'GET', url: '/v1/snippets' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a snippet',
				description: 'Update an existing snippet',
				routing: { request: { method: 'PUT', url: '=/v1/snippets/{{ $parameter.snippetId }}' } },
			},
		],
		default: 'getAll',
	},

	snippetIdField,
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showCreateUpdate },
		routing: { send: { type: 'body', property: 'name', value: '={{ $value }}' } },
		description: 'A human-readable name for the snippet',
	},
	{
		displayName: 'Script',
		name: 'script',
		type: 'string',
		typeOptions: { rows: 6 },
		default: '',
		required: true,
		displayOptions: { show: showCreateUpdate },
		routing: { send: { type: 'body', property: 'script', value: '={{ $value }}' } },
		description: 'The reusable script content',
	},

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
