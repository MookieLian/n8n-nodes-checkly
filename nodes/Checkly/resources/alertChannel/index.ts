import type { INodeProperties } from 'n8n-workflow';
import { alertChannelLocator, checkGroupLocator, checkLocator, limitField, pageOption } from '../../shared/descriptions';

const showFor = { resource: ['alertChannel'] };

export const alertChannelDescription: INodeProperties[] = [
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
				action: 'Create an alert channel',
				description: 'Create a new alert channel',
				routing: { request: { method: 'POST', url: '/v1/alert-channels' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete an alert channel',
				description: 'Delete an alert channel',
				routing: {
					request: { method: 'DELETE', url: '=/v1/alert-channels/{{ $parameter.alertChannelId }}' },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get an alert channel',
				description: 'Retrieve a single alert channel by ID',
				routing: { request: { method: 'GET', url: '=/v1/alert-channels/{{ $parameter.alertChannelId }}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many alert channels',
				description: 'List alert channels in the account',
				routing: { request: { method: 'GET', url: '/v1/alert-channels' } },
			},
			{
				name: 'Subscribe',
				value: 'subscribe',
				action: 'Subscribe a check or group to an alert channel',
				description: 'Attach a check or check group to an alert channel',
				routing: {
					request: {
						method: 'PUT',
						url: '=/v1/alert-channels/{{ $parameter.alertChannelId }}/subscriptions',
					},
				},
			},
		],
		default: 'getAll',
	},

	alertChannelLocator({ ...showFor, operation: ['get', 'delete', 'subscribe'] }, { inPath: true }),

	// Create fields
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: [
			{ name: 'Call', value: 'CALL' },
			{ name: 'Email', value: 'EMAIL' },
			{ name: 'Opsgenie', value: 'OPSGENIE' },
			{ name: 'PagerDuty', value: 'PAGERDUTY' },
			{ name: 'Slack', value: 'SLACK' },
			{ name: 'SMS', value: 'SMS' },
			{ name: 'Webhook', value: 'WEBHOOK' },
		],
		default: 'EMAIL',
		displayOptions: { show: { ...showFor, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'type', value: '={{ $value }}' } },
		description: 'The type of alert channel',
	},
	{
		displayName: 'Config (JSON)',
		name: 'config',
		type: 'json',
		default: '{\n  "address": "alerts@example.com"\n}',
		required: true,
		displayOptions: { show: { ...showFor, operation: ['create'] } },
		routing: { send: { type: 'body', property: 'config', value: '={{ JSON.parse($value) }}' } },
		description: 'Type-specific configuration. For Email use {"address": "..."}; for Webhook use {"name": "...", "URL": "...", "method": "POST"}. See the Checkly API reference.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showFor, operation: ['create'] } },
		options: [
			{
				displayName: 'Auto Subscribe',
				name: 'autoSubscribe',
				type: 'boolean',
				default: false,
				routing: { send: { type: 'body', property: 'autoSubscribe', value: '={{ $value }}' } },
				description: 'Whether to automatically subscribe all current and future checks',
			},
			{
				displayName: 'Send Degraded',
				name: 'sendDegraded',
				type: 'boolean',
				default: false,
				routing: { send: { type: 'body', property: 'sendDegraded', value: '={{ $value }}' } },
				description: 'Whether to send a notification when a check degrades',
			},
			{
				displayName: 'Send Failure',
				name: 'sendFailure',
				type: 'boolean',
				default: true,
				routing: { send: { type: 'body', property: 'sendFailure', value: '={{ $value }}' } },
				description: 'Whether to send a notification when a check fails',
			},
			{
				displayName: 'Send Recovery',
				name: 'sendRecovery',
				type: 'boolean',
				default: true,
				routing: { send: { type: 'body', property: 'sendRecovery', value: '={{ $value }}' } },
				description: 'Whether to send a notification when a check recovers',
			},
		],
	},

	// Subscribe fields
	checkLocator({ ...showFor, operation: ['subscribe'] }, { sendType: 'body', required: false }),
	checkGroupLocator({ ...showFor, operation: ['subscribe'] }, { sendType: 'body', required: false }),
	{
		displayName: 'Activated',
		name: 'activated',
		type: 'boolean',
		default: true,
		displayOptions: { show: { ...showFor, operation: ['subscribe'] } },
		routing: { send: { type: 'body', property: 'activated', value: '={{ $value }}' } },
		description: 'Whether the subscription is active',
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
