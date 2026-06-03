import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { checkDescription } from './resources/check';
import { checkGroupDescription } from './resources/checkGroup';
import { checkResultDescription } from './resources/checkResult';
import { checkStatusDescription } from './resources/checkStatus';
import { alertChannelDescription } from './resources/alertChannel';
import { dashboardDescription } from './resources/dashboard';
import { snippetDescription } from './resources/snippet';
import { environmentVariableDescription } from './resources/environmentVariable';
import { maintenanceWindowDescription } from './resources/maintenanceWindow';
import { locationDescription } from './resources/location';
import { runtimeDescription } from './resources/runtime';

import { getChecks } from './listSearch/getChecks';
import { getCheckGroups } from './listSearch/getCheckGroups';
import { getAlertChannels } from './listSearch/getAlertChannels';

export class Checkly implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Checkly',
		name: 'checkly',
		icon: 'file:checkly.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage checks, alerts and monitoring resources in Checkly',
		defaults: {
			name: 'Checkly',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'checklyApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.checklyhq.com',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Alert Channel', value: 'alertChannel' },
					{ name: 'Check', value: 'check' },
					{ name: 'Check Group', value: 'checkGroup' },
					{ name: 'Check Result', value: 'checkResult' },
					{ name: 'Check Status', value: 'checkStatus' },
					{ name: 'Dashboard', value: 'dashboard' },
					{ name: 'Environment Variable', value: 'environmentVariable' },
					{ name: 'Location', value: 'location' },
					{ name: 'Maintenance Window', value: 'maintenanceWindow' },
					{ name: 'Runtime', value: 'runtime' },
					{ name: 'Snippet', value: 'snippet' },
				],
				default: 'check',
			},
			...checkDescription,
			...checkGroupDescription,
			...checkResultDescription,
			...checkStatusDescription,
			...alertChannelDescription,
			...dashboardDescription,
			...snippetDescription,
			...environmentVariableDescription,
			...maintenanceWindowDescription,
			...locationDescription,
			...runtimeDescription,
		],
	};

	methods = {
		listSearch: {
			getChecks,
			getCheckGroups,
			getAlertChannels,
		},
	};
}
