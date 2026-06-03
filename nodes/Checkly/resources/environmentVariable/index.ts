import type { INodeProperties } from 'n8n-workflow';
import { limitField, pageOption } from '../../shared/descriptions';

const showFor = { resource: ['environmentVariable'] };

// The variable key is carried in the URL path for single-variable operations.
const keyField = (operation: string[], required: boolean): INodeProperties => ({
	displayName: 'Key',
	name: 'key',
	type: 'string',
	default: '',
	required,
	displayOptions: { show: { ...showFor, operation } },
	placeholder: 'e.g. API_BASE_URL',
	description: 'The name (key) of the environment variable',
});

export const environmentVariableDescription: INodeProperties[] = [
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
				action: 'Create an environment variable',
				description: 'Create a new global environment variable',
				routing: { request: { method: 'POST', url: '/v1/variables' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete an environment variable',
				description: 'Delete an environment variable',
				routing: {
					request: { method: 'DELETE', url: '=/v1/variables/{{ encodeURIComponent($parameter.key) }}' },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get an environment variable',
				description: 'Retrieve a single environment variable by key',
				routing: {
					request: { method: 'GET', url: '=/v1/variables/{{ encodeURIComponent($parameter.key) }}' },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many environment variables',
				description: 'List global environment variables',
				routing: { request: { method: 'GET', url: '/v1/variables' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update an environment variable',
				description: 'Update an existing environment variable',
				routing: {
					request: { method: 'PUT', url: '=/v1/variables/{{ encodeURIComponent($parameter.key) }}' },
				},
			},
		],
		default: 'getAll',
	},

	keyField(['get', 'delete', 'update'], true),
	{
		// Sent in the body for create; the key also goes in the body alongside the value.
		displayName: 'Key',
		name: 'key',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...showFor, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'key', value: '={{ $value }}' } },
		placeholder: 'e.g. API_BASE_URL',
		description: 'The name (key) of the environment variable',
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		required: true,
		displayOptions: { show: { ...showFor, operation: ['create', 'update'] } },
		routing: { send: { type: 'body', property: 'value', value: '={{ $value }}' } },
		description: 'The value of the environment variable',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showFor, operation: ['create', 'update'] } },
		options: [
			{
				displayName: 'Locked',
				name: 'locked',
				type: 'boolean',
				default: false,
				routing: { send: { type: 'body', property: 'locked', value: '={{ $value }}' } },
				description: 'Whether the variable is locked (visible only to team owners and admins)',
			},
			{
				displayName: 'Secret',
				name: 'isSecret',
				type: 'boolean',
				default: false,
				routing: { send: { type: 'body', property: 'secret', value: '={{ $value }}' } },
				description: 'Whether the value is stored as a secret and never returned by the API',
			},
		],
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
