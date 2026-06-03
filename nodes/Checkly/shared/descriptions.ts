import type { IDisplayOptions, INodeProperties } from 'n8n-workflow';

type DisplayShow = IDisplayOptions['show'];

interface LocatorOptions {
	// When true the value is used only in the URL path (no routing.send is attached);
	// reference it in the URL with {{ $parameter.<name> }}.
	inPath?: boolean;
	// Where to place the value when not a path parameter.
	sendType?: 'body' | 'query';
	required?: boolean;
}

// Generic searchable resource picker (From List via a listSearch method, or By ID).
function locator(
	displayName: string,
	name: string,
	searchListMethod: string,
	description: string,
	show: DisplayShow,
	{ inPath = false, sendType = 'body', required = true }: LocatorOptions = {},
): INodeProperties {
	const field: INodeProperties = {
		displayName,
		name,
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required,
		displayOptions: { show },
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: { searchListMethod, searchable: true },
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. 3c90c3cc-0d44-4b50-8888-8dd25736052a',
			},
		],
		description,
	};

	if (!inPath) {
		field.routing = { send: { type: sendType, property: name, value: '={{ $value }}' } };
	}

	return field;
}

export function checkLocator(show: DisplayShow, opts: LocatorOptions = {}): INodeProperties {
	return locator('Check', 'checkId', 'getChecks', 'The check to operate on', show, opts);
}

export function checkGroupLocator(show: DisplayShow, opts: LocatorOptions = {}): INodeProperties {
	return locator('Check Group', 'groupId', 'getCheckGroups', 'The check group to operate on', show, opts);
}

export function alertChannelLocator(show: DisplayShow, opts: LocatorOptions = {}): INodeProperties {
	return locator(
		'Alert Channel',
		'alertChannelId',
		'getAlertChannels',
		'The alert channel to operate on',
		show,
		opts,
	);
}

// Standard "Limit" field for Get Many operations (Checkly caps page size at 100).
export function limitField(show: DisplayShow): INodeProperties {
	return {
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 50,
		displayOptions: { show },
		routing: { send: { type: 'query', property: 'limit', value: '={{ $value }}' } },
		description: 'Max number of results to return',
	};
}

// "Page" option (1-based) for paging through Get Many results.
export const pageOption: INodeProperties = {
	displayName: 'Page',
	name: 'page',
	type: 'number',
	typeOptions: { minValue: 1 },
	default: 1,
	routing: { send: { type: 'query', property: 'page', value: '={{ $value }}' } },
	description: 'The page of results to return (1-based)',
};

// A free-form JSON object merged into the request body, letting power users set any
// field the Checkly API supports that is not exposed as a dedicated input.
export function additionalBodyJsonField(show: DisplayShow): INodeProperties {
	return {
		displayName: 'Additional Body Fields (JSON)',
		name: 'additionalBodyJson',
		type: 'json',
		default: '{}',
		displayOptions: { show },
		description:
			'Extra properties merged into the request body. Use this for any field not exposed above (see the Checkly API reference).',
	};
}
