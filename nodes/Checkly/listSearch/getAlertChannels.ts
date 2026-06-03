import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { checklyApiRequest } from '../shared/transport';

type AlertChannel = { id: number; type: string; config?: { name?: string; url?: string } };

export async function getAlertChannels(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const response = (await checklyApiRequest.call(this, 'GET', '/v1/alert-channels', undefined, {
		limit: 100,
	})) as AlertChannel[];

	const lowerFilter = (filter ?? '').toLowerCase();
	const results: INodeListSearchItems[] = (response ?? [])
		.map((channel) => {
			const label = channel.config?.name ?? channel.config?.url ?? channel.type;
			return { name: `${label} (#${channel.id})`, value: String(channel.id) };
		})
		.filter((item) => !filter || item.name.toLowerCase().includes(lowerFilter));

	return { results };
}
