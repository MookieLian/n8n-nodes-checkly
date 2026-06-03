import type { INodeProperties } from 'n8n-workflow';
import { additionalBodyJsonField, checkLocator, limitField, pageOption } from '../../shared/descriptions';
import { buildCheckBody, mergeAdditionalJson } from '../../shared/preSend';

const showForCheck = { resource: ['check'] };
const showCreateUpdate = { ...showForCheck, operation: ['create', 'update'] };

export const checkDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForCheck },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a check',
				description: 'Create a new API or Browser check',
				routing: {
					send: { preSend: [buildCheckBody, mergeAdditionalJson] },
					request: {
						method: 'POST',
						url: '=/v1/checks/{{ $parameter.checkType === "BROWSER" ? "browser" : "api" }}',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a check',
				description: 'Delete a check',
				routing: { request: { method: 'DELETE', url: '=/v1/checks/{{ $parameter.checkId }}' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a check',
				description: 'Retrieve a single check by ID',
				routing: { request: { method: 'GET', url: '=/v1/checks/{{ $parameter.checkId }}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many checks',
				description: 'List checks in the account',
				routing: { request: { method: 'GET', url: '/v1/checks' } },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a check',
				description: 'Update an existing API or Browser check',
				routing: {
					send: { preSend: [buildCheckBody, mergeAdditionalJson] },
					request: {
						method: 'PUT',
						url: '=/v1/checks/{{ $parameter.checkType === "BROWSER" ? "browser" : "api" }}/{{ $parameter.checkId }}',
					},
				},
			},
		],
		default: 'getAll',
	},

	// Check picker for single-check operations (path parameter).
	checkLocator({ ...showForCheck, operation: ['get', 'delete', 'update'] }, { inPath: true }),

	// Create / Update fields
	{
		displayName: 'Check Type',
		name: 'checkType',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'API', value: 'API' },
			{ name: 'Browser', value: 'BROWSER' },
		],
		default: 'API',
		displayOptions: { show: showCreateUpdate },
		description: 'The type of check. Determines which Checkly endpoint is used.',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...showForCheck, operation: ['create'] } },
		placeholder: 'e.g. Homepage uptime',
		description: 'A human-readable name for the check',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		displayOptions: { show: { ...showForCheck, operation: ['update'] } },
		description: 'A new name for the check (leave empty to keep the current name)',
	},
	{
		displayName: 'Request URL',
		name: 'requestUrl',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...showCreateUpdate, checkType: ['API'] } },
		placeholder: 'https://www.example.com/health',
		description: 'The URL the API check requests',
	},
	{
		displayName: 'Request Method',
		name: 'requestMethod',
		type: 'options',
		options: [
			{ name: 'DELETE', value: 'DELETE' },
			{ name: 'GET', value: 'GET' },
			{ name: 'HEAD', value: 'HEAD' },
			{ name: 'PATCH', value: 'PATCH' },
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' },
		],
		default: 'GET',
		displayOptions: { show: { ...showCreateUpdate, checkType: ['API'] } },
		description: 'The HTTP method used by the API check',
	},
	{
		displayName: 'Script',
		name: 'script',
		type: 'string',
		typeOptions: { rows: 6 },
		default: '',
		required: true,
		displayOptions: { show: { ...showCreateUpdate, checkType: ['BROWSER'] } },
		placeholder: "const { test, expect } = require('@playwright/test')\n...",
		description: 'The Playwright script the Browser check runs',
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
				description: 'Whether the check is enabled and runs on its schedule',
			},
			{
				displayName: 'Frequency (Minutes)',
				name: 'frequency',
				type: 'options',
				options: [
					{ name: '1 Minute', value: 1 },
					{ name: '5 Minutes', value: 5 },
					{ name: '10 Minutes', value: 10 },
					{ name: '15 Minutes', value: 15 },
					{ name: '30 Minutes', value: 30 },
					{ name: '60 Minutes', value: 60 },
					{ name: '720 Minutes', value: 720 },
					{ name: '1440 Minutes', value: 1440 },
				],
				default: 5,
				description: 'How often the check runs',
			},
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				description: 'ID of the check group this check belongs to',
			},
			{
				displayName: 'Locations',
				name: 'locations',
				type: 'string',
				default: '',
				placeholder: 'us-east-1,eu-west-1',
				description: 'Comma-separated location codes the check runs from',
			},
			{
				displayName: 'Muted',
				name: 'muted',
				type: 'boolean',
				default: false,
				description: 'Whether alert notifications are muted for this check',
			},
			{
				displayName: 'Runtime ID',
				name: 'runtimeId',
				type: 'string',
				default: '',
				placeholder: 'e.g. 2024.02',
				description: 'The runtime version used to execute the check',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				placeholder: 'production,api',
				description: 'Comma-separated tags to attach to the check',
			},
		],
	},
	additionalBodyJsonField(showCreateUpdate),

	// Get Many filters
	limitField({ ...showForCheck, operation: ['getAll'] }),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { ...showForCheck, operation: ['getAll'] } },
		options: [
			pageOption,
			{
				displayName: 'Check Type',
				name: 'checkType',
				type: 'string',
				default: '',
				placeholder: 'API',
				routing: { send: { type: 'query', property: 'checkType', value: '={{ $value }}' } },
				description: 'Filter by check type (e.g. API, BROWSER)',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				routing: { send: { type: 'query', property: 'search', value: '={{ $value }}' } },
				description: 'Filter checks by a search term',
			},
		],
	},
];
