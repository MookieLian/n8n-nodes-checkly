import type {
	IDataObject,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
} from 'n8n-workflow';

export const CHECKLY_BASE_URL = 'https://api.checklyhq.com';

// Authenticated request helper for code paths that run outside the declarative
// routing pipeline: listSearch methods and the trigger node's webhook lifecycle.
// Applies the credential auth flow (Bearer + X-Checkly-Account headers).
export async function checklyApiRequest(
	this:
		| IExecuteFunctions
		| IExecuteSingleFunctions
		| ILoadOptionsFunctions
		| IHookFunctions
		| IWebhookFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: IDataObject | undefined = undefined,
	qs: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const options: IHttpRequestOptions = {
		method,
		qs,
		body,
		url: `${CHECKLY_BASE_URL}${resource}`,
		json: true,
	};

	if (body === undefined) {
		delete options.body;
	}

	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'checklyApi',
		options,
	)) as IDataObject | IDataObject[];
}
