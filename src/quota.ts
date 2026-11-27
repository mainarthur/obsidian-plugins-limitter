import { App } from 'obsidian';
import { getManifests } from './internals';

export const BASE_LIMIT = 5;
export const FILES_PER_SLOT = 10;

export interface Quota {
	filesCount: number;
	pluginsCount: number;
	limit: number;
	remaining: number;
	nextMilestone: number;
	limitReached: boolean;
}

export function getQuota(app: App): Quota {
	const filesCount = app.vault.getFiles().length;
	// Counts all installed community plugins, including disabled ones
	const pluginsCount = Object.keys(getManifests(app)).length;
	const limit = BASE_LIMIT + Math.floor(filesCount / FILES_PER_SLOT);
	const remaining = limit - pluginsCount;
	const nextMilestone = FILES_PER_SLOT - (filesCount % FILES_PER_SLOT);

	return {
		filesCount,
		pluginsCount,
		limit,
		remaining,
		nextMilestone,
		limitReached: pluginsCount >= limit,
	};
}
