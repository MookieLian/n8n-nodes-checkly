import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { checklyApiRequest } from '../shared/transport';

type CheckGroup = { id: number; name: string };

export async function getCheckGroups(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const response = (await checklyApiRequest.call(this, 'GET', '/v1/check-groups', undefined, {
		limit: 100,
	})) as CheckGroup[];

	const lowerFilter = (filter ?? '').toLowerCase();
	const results: INodeListSearchItems[] = (response ?? [])
		.filter((group) => !filter || group.name.toLowerCase().includes(lowerFilter))
		.map((group) => ({ name: group.name, value: String(group.id) }));

	return { results };
}
