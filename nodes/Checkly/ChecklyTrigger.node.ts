import { createHmac, randomBytes } from 'crypto';
import {
	NodeConnectionTypes,
	type IDataObject,
	type IHookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';

import { checklyApiRequest } from './shared/transport';
import { getChecks } from './listSearch/getChecks';
import { getCheckGroups } from './listSearch/getCheckGroups';

// Default Handlebars payload Checkly renders and POSTs to the n8n webhook.
// Every value is quoted so the rendered body is always valid JSON, even when a
// variable is empty for a given event.
const WEBHOOK_TEMPLATE = JSON.stringify({
	event: '{{ALERT_TYPE}}',
	alertType: '{{ALERT_TYPE}}',
	checkName: '{{CHECK_NAME}}',
	checkId: '{{CHECK_ID}}',
	checkType: '{{CHECK_TYPE}}',
	checkResultId: '{{CHECK_RESULT_ID}}',
	responseTime: '{{RESPONSE_TIME}}',
	runLocation: '{{RUN_LOCATION}}',
	tags: '{{TAGS}}',
	startedAt: '{{STARTED_AT}}',
	link: '{{RESULT_LINK}}',
});

// Subscribes a single check or group to an alert channel. The `subscriptions` field
// on the create call is ignored by the API, so this dedicated endpoint must be used.
async function subscribeTarget(
	this: IHookFunctions,
	channelId: number,
	target: { checkId: string } | { groupId: number },
): Promise<void> {
	const body: IDataObject = { ...target, activated: true };
	await checklyApiRequest.call(
		this,
		'PUT',
		`/v1/alert-channels/${channelId}/subscriptions`,
		body,
	);
}

// Fetches the IDs of all checks in the account, paging through the list.
async function getAllCheckIds(this: IHookFunctions): Promise<string[]> {
	const ids: string[] = [];
	const limit = 100;
	let page = 1;
	let fetchMore = true;
	while (fetchMore) {
		const batch = (await checklyApiRequest.call(this, 'GET', '/v1/checks', undefined, {
			limit,
			page,
		})) as Array<{ id: string }>;
		if (!Array.isArray(batch) || batch.length === 0) {
			break;
		}
		for (const check of batch) {
			ids.push(check.id);
		}
		if (batch.length < limit) {
			fetchMore = false;
		} else {
			page += 1;
		}
	}
	return ids;
}

export class ChecklyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Checkly Trigger',
		name: 'checklyTrigger',
		icon: 'file:checkly.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when Checkly sends a check alert',
		defaults: {
			name: 'Checkly Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'checklyApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'On activation this node creates a webhook alert channel in Checkly and removes it when the workflow is deactivated.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: [
					{ name: 'Check Degraded', value: 'sendDegraded' },
					{ name: 'Check Failed', value: 'sendFailure' },
					{ name: 'Check Recovered', value: 'sendRecovery' },
					{ name: 'SSL Certificate Expiring', value: 'sslExpiry' },
				],
				default: ['sendFailure', 'sendRecovery'],
				required: true,
				description: 'Which Checkly events should trigger this workflow',
			},
			{
				displayName: 'Subscribe To',
				name: 'subscribeTo',
				type: 'options',
				options: [
					{ name: 'All Checks', value: 'all' },
					{ name: 'Specific Check', value: 'check' },
					{ name: 'Specific Check Group', value: 'group' },
				],
				default: 'all',
				description: 'Which checks should send alerts to this trigger',
			},
			{
				displayName: 'Check',
				name: 'checkId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: { show: { subscribeTo: ['check'] } },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: { searchListMethod: 'getChecks', searchable: true },
					},
					{ displayName: 'By ID', name: 'id', type: 'string' },
				],
				description: 'The check to subscribe to',
			},
			{
				displayName: 'Check Group',
				name: 'groupId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: { show: { subscribeTo: ['group'] } },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: { searchListMethod: 'getCheckGroups', searchable: true },
					},
					{ displayName: 'By ID', name: 'id', type: 'string' },
				],
				description: 'The check group to subscribe to',
			},
			{
				displayName: 'Verify Signature',
				name: 'verifySignature',
				type: 'boolean',
				default: true,
				description:
					'Whether to reject requests whose x-checkly-signature header does not match the generated secret',
			},
		],
		usableAsTool: true,
	};

	methods = {
		listSearch: {
			getChecks,
			getCheckGroups,
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (!data.alertChannelId) {
					return false;
				}
				try {
					await checklyApiRequest.call(
						this,
						'GET',
						`/v1/alert-channels/${data.alertChannelId}`,
					);
					return true;
				} catch {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const events = this.getNodeParameter('events', []) as string[];
				const subscribeTo = this.getNodeParameter('subscribeTo', 'all') as string;

				const secret = randomBytes(24).toString('hex');

				// Create the webhook alert channel. `autoSubscribe` only affects checks
				// created in the FUTURE, so it is enabled only for the "all checks" mode.
				// Existing checks must be subscribed individually via the subscriptions
				// endpoint below — the `subscriptions` field in this body is ignored.
				const response = (await checklyApiRequest.call(this, 'POST', '/v1/alert-channels', {
					type: 'WEBHOOK',
					config: {
						name: 'n8n Checkly Trigger',
						url: webhookUrl,
						method: 'POST',
						template: WEBHOOK_TEMPLATE,
						webhookSecret: secret,
					},
					sendFailure: events.includes('sendFailure'),
					sendRecovery: events.includes('sendRecovery'),
					sendDegraded: events.includes('sendDegraded'),
					sslExpiry: events.includes('sslExpiry'),
					autoSubscribe: subscribeTo === 'all',
				})) as { id: number };

				const channelId = response.id;

				if (subscribeTo === 'check') {
					const checkId = this.getNodeParameter('checkId', undefined, {
						extractValue: true,
					}) as string;
					await subscribeTarget.call(this, channelId, { checkId });
				} else if (subscribeTo === 'group') {
					const groupId = this.getNodeParameter('groupId', undefined, {
						extractValue: true,
					}) as string;
					await subscribeTarget.call(this, channelId, { groupId: Number(groupId) });
				} else {
					// Subscribe every existing check; future checks are covered by autoSubscribe.
					const checkIds = await getAllCheckIds.call(this);
					for (const checkId of checkIds) {
						try {
							await subscribeTarget.call(this, channelId, { checkId });
						} catch {
							// Best effort — skip checks that cannot be subscribed.
						}
					}
				}

				const data = this.getWorkflowStaticData('node');
				data.alertChannelId = channelId;
				data.webhookSecret = secret;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (data.alertChannelId) {
					try {
						await checklyApiRequest.call(
							this,
							'DELETE',
							`/v1/alert-channels/${data.alertChannelId}`,
						);
					} catch {
						// Channel may already be gone; treat deletion as best-effort.
					}
					delete data.alertChannelId;
					delete data.webhookSecret;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const verifySignature = this.getNodeParameter('verifySignature', true) as boolean;
		const bodyData = this.getBodyData();

		if (verifySignature) {
			const data = this.getWorkflowStaticData('node');
			const secret = data.webhookSecret as string | undefined;
			const req = this.getRequestObject();
			const signature = req.headers['x-checkly-signature'] as string | undefined;
			const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;

			if (secret && rawBody) {
				const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
				if (signature !== expected) {
					return { noWebhookResponse: true };
				}
			}
		}

		return {
			workflowData: [this.helpers.returnJsonArray(bodyData as IDataObject)],
		};
	}
}
