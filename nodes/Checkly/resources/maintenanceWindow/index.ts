import type { INodeProperties } from 'n8n-workflow';
import { additionalBodyJsonField, limitField, pageOption } from '../../shared/descriptions';
import { mergeAdditionalJson } from '../../shared/preSend';

const showFor = { resource: ['maintenanceWindow'] };
const showCreateUpdate = { ...showFor, operation: ['create', 'update'] };

const windowIdField: INodeProperties = {
	displayName: 'Maintenance Window ID',
	name: 'windowId',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { ...showFor, operation: ['get', 'update', 'delete'] } },
	description: 'The ID of the maintenance window',
};

export const maintenanceWindowDescription: INodeProperties[] = [
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
				action: 'Create a maintenance window',
				description: 'Create a new maintenance window',
				routing: {
					send: { preSend: [mergeAdditionalJson] },
					request: { method: 'POST', url: '/v1/maintenance-windows' },
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a maintenance window',
				description: 'Delete a maintenance window',
				routing: {
					request: { method: 'DELETE', url: '=/v1/maintenance-windows/{{ $parameter.windowId }}' },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a maintenance window',
				description: 'Retrieve a single maintenance window by ID',
				routing: { request: { method: 'GET', url: '=/v1/maintenance-windows/{{ $parameter.windowId }}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many maintenance windows',
				description: 'List maintenance windows in the account',
				routing: { request: { method: 'GET', url: '/v1/maintenance-windows' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a maintenance window',
				description: 'Update an existing maintenance window',
				routing: {
					send: { preSend: [mergeAdditionalJson] },
					request: { method: 'PUT', url: '=/v1/maintenance-windows/{{ $parameter.windowId }}' },
				},
			},
		],
		default: 'getAll',
	},

	windowIdField,
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...showFor, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'name', value: '={{ $value }}' } },
		description: 'A human-readable name for the maintenance window',
	},
	{
		displayName: 'Starts At',
		name: 'startsAt',
		type: 'dateTime',
		default: '',
		required: true,
		displayOptions: { show: { ...showFor, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'startsAt', value: '={{ $value }}' } },
		description: 'When the maintenance window begins',
	},
	{
		displayName: 'Ends At',
		name: 'endsAt',
		type: 'dateTime',
		default: '',
		required: true,
		displayOptions: { show: { ...showFor, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'endsAt', value: '={{ $value }}' } },
		description: 'When the maintenance window ends',
	},
	{
		displayName: 'Repeat Unit',
		name: 'repeatUnit',
		type: 'options',
		options: [
			{ name: 'Day', value: 'DAY' },
			{ name: 'Week', value: 'WEEK' },
			{ name: 'Month', value: 'MONTH' },
		],
		default: 'WEEK',
		required: true,
		displayOptions: { show: { ...showFor, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'repeatUnit', value: '={{ $value }}' } },
		description: 'The unit the maintenance window repeats on',
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
