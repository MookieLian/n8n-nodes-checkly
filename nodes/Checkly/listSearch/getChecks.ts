import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { checklyApiRequest } from '../shared/transport';

type Check = { id: string; name: string; checkType?: string };

export async function getChecks(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const response = (await checklyApiRequest.call(this, 'GET', '/v1/checks', undefined, {
		limit: 100,
	})) as Check[];

	const lowerFilter = (filter ?? '').toLowerCase();
	const results: INodeListSearchItems[] = (response ?? [])
		.filter((check) => !filter || check.name.toLowerCase().includes(lowerFilter))
		.map((check) => ({
			name: check.checkType ? `${check.name} (${check.checkType})` : check.name,
			value: check.id,
		}));

	return { results };
}
