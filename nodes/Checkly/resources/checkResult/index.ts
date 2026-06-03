import type { INodeProperties } from 'n8n-workflow';
import { checkLocator, limitField, pageOption } from '../../shared/descriptions';

const showFor = { resource: ['checkResult'] };

export const checkResultDescription: INodeProperties[] = [
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
				action: 'Get a check result',
				description: 'Retrieve a single check result by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/check-results/{{ $parameter.checkId }}/{{ $parameter.checkResultId }}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many check results',
				description: 'List results for a check',
				routing: { request: { method: 'GET', url: '=/v1/check-results/{{ $parameter.checkId }}' } },
			},
		],
		default: 'getAll',
	},

	checkLocator({ ...showFor, operation: ['get', 'getAll'] }, { inPath: true }),
	{
		displayName: 'Check Result ID',
		name: 'checkResultId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...showFor, operation: ['get'] } },
		description: 'The ID of the check result to retrieve',
	},

	limitField({ ...showFor, operation: ['getAll'] }),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { ...showFor, operation: ['getAll'] } },
		options: [
			pageOption,
			{
				displayName: 'From',
				name: 'from',
				type: 'dateTime',
				default: '',
				routing: { send: { type: 'query', property: 'from', value: '={{ new Date($value).getTime() / 1000 }}' } },
				description: 'Only return results created after this time',
			},
			{
				displayName: 'Has Failures',
				name: 'hasFailures',
				type: 'boolean',
				default: false,
				routing: { send: { type: 'query', property: 'hasFailures', value: '={{ $value }}' } },
				description: 'Whether to only return results that contain failures',
			},
			{
				displayName: 'Result Type',
				name: 'resultType',
				type: 'options',
				options: [
					{ name: 'All', value: 'ALL' },
					{ name: 'Attempt', value: 'ATTEMPT' },
					{ name: 'Final', value: 'FINAL' },
				],
				default: 'FINAL',
				routing: { send: { type: 'query', property: 'resultType', value: '={{ $value }}' } },
				description: 'Which result types to return',
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'dateTime',
				default: '',
				routing: { send: { type: 'query', property: 'to', value: '={{ new Date($value).getTime() / 1000 }}' } },
				description: 'Only return results created before this time',
			},
		],
	},
];
