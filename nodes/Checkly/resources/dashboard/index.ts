import type { INodeProperties } from 'n8n-workflow';
import { additionalBodyJsonField, limitField, pageOption } from '../../shared/descriptions';
import { mergeAdditionalJson } from '../../shared/preSend';

const showFor = { resource: ['dashboard'] };
const showCreateUpdate = { ...showFor, operation: ['create', 'update'] };

const dashboardIdField: INodeProperties = {
	displayName: 'Dashboard ID',
	name: 'dashboardId',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { ...showFor, operation: ['get', 'update', 'delete'] } },
	description: 'The ID of the dashboard',
};

export const dashboardDescription: INodeProperties[] = [
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
				action: 'Create a dashboard',
				description: 'Create a new dashboard',
				routing: {
					send: { preSend: [mergeAdditionalJson] },
					request: { method: 'POST', url: '/v1/dashboards' },
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a dashboard',
				description: 'Delete a dashboard',
				routing: { request: { method: 'DELETE', url: '=/v1/dashboards/{{ $parameter.dashboardId }}' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a dashboard',
				description: 'Retrieve a single dashboard by ID',
				routing: { request: { method: 'GET', url: '=/v1/dashboards/{{ $parameter.dashboardId }}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many dashboards',
				description: 'List dashboards in the account',
				routing: { request: { method: 'GET', url: '/v1/dashboards' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a dashboard',
				description: 'Update an existing dashboard',
				routing: {
					send: { preSend: [mergeAdditionalJson] },
					request: { method: 'PUT', url: '=/v1/dashboards/{{ $parameter.dashboardId }}' },
				},
			},
		],
		default: 'getAll',
	},

	dashboardIdField,
	{
		displayName: 'Header',
		name: 'header',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...showFor, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'header', value: '={{ $value }}' } },
		description: 'The title shown at the top of the dashboard',
	},
	{
		displayName: 'Custom URL',
		name: 'customUrl',
		type: 'string',
		default: '',
		displayOptions: { show: showCreateUpdate },
		placeholder: 'e.g. my-team-status',
		routing: { send: { type: 'body', property: 'customUrl', value: '={{ $value }}' } },
		description:
			'A unique subdomain under checklyhq.com (e.g. "my-team-status" → my-team-status.checklyhq.com). Strongly recommended: dashboards created without one can break "Get Many".',
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
