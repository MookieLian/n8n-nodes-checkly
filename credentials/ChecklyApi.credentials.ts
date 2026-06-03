import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

// Base URL for the Checkly public REST API. All resources live under /v1.
export const checklyBaseUrl = 'https://api.checklyhq.com';

export class ChecklyApi implements ICredentialType {
	name = 'checklyApi';

	displayName = 'Checkly API';

	icon: Icon = 'file:../nodes/Checkly/checkly.svg';

	documentationUrl = 'https://www.checklyhq.com/docs/api-reference/overview/';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'A User or Service API key. Create one under User Settings → API keys (or Account Settings → API keys for service keys) in Checkly.',
		},
		{
			displayName: 'Account ID',
			name: 'accountId',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'e.g. 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
			description: 'Your Checkly account ID, found under Account Settings → General',
		},
	];

	// Checkly requires BOTH a Bearer token and the target account ID on every request.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'X-Checkly-Account': '={{$credentials.accountId}}',
			},
		},
	};

	// Verifies both headers against a lightweight, always-available endpoint.
	test: ICredentialTestRequest = {
		request: {
			baseURL: checklyBaseUrl,
			url: '/v1/checks',
			method: 'GET',
			qs: { limit: 1 },
		},
	};
}
