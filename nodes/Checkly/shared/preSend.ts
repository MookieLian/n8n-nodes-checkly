import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// Merges the optional "Additional Body Fields (JSON)" parameter into the request body.
// Dedicated inputs take precedence; the JSON object fills in everything else.
export async function mergeAdditionalJson(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const raw = this.getNodeParameter('additionalBodyJson', {}) as IDataObject | string;
	if (raw === undefined || raw === null || raw === '' || raw === '{}') {
		return requestOptions;
	}

	let parsed: IDataObject;
	try {
		parsed = typeof raw === 'string' ? (JSON.parse(raw) as IDataObject) : raw;
	} catch {
		throw new NodeOperationError(
			this.getNode(),
			'Additional Body Fields (JSON) is not valid JSON',
		);
	}

	const existing = (requestOptions.body as IDataObject) ?? {};
	requestOptions.body = { ...parsed, ...existing };
	return requestOptions;
}

function csvToArray(value: unknown): string[] {
	return String(value)
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

// Assembles the request body for Check create/update from the friendly inputs.
// Runs before mergeAdditionalJson, so the JSON escape hatch can add anything else.
export async function buildCheckBody(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const checkType = this.getNodeParameter('checkType', 'API') as string;
	const body: IDataObject = (requestOptions.body as IDataObject) ?? {};

	const name = this.getNodeParameter('name', '') as string;
	if (name) body.name = name;

	if (checkType === 'BROWSER') {
		const script = this.getNodeParameter('script', '') as string;
		if (script) body.script = script;
	} else {
		const url = this.getNodeParameter('requestUrl', '') as string;
		const method = this.getNodeParameter('requestMethod', 'GET') as string;
		const request: IDataObject = { ...((body.request as IDataObject) ?? {}) };
		if (url) request.url = url;
		if (method) request.method = method;
		if (Object.keys(request).length) body.request = request;
	}

	const add = this.getNodeParameter('additionalFields', {}) as IDataObject;
	if (add.activated !== undefined) body.activated = add.activated;
	if (add.muted !== undefined) body.muted = add.muted;
	if (add.frequency !== undefined) body.frequency = add.frequency;
	if (add.groupId) body.groupId = Number(add.groupId);
	if (add.runtimeId) body.runtimeId = add.runtimeId;
	if (add.locations) body.locations = csvToArray(add.locations);
	if (add.tags) body.tags = csvToArray(add.tags);

	requestOptions.body = body;
	return requestOptions;
}
