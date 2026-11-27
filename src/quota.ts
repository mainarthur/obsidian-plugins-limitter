import { App } from 'obsidian';
import { getManifests } from './internals';

export const BASE_LIMIT = 5;
export const FILES_PER_SLOT = 10;

export interface Quota {
	filesCount: number;
	pluginsCount: number;
	limit: number;
	remaining: number;
	// Files counted toward the next slot (0..FILES_PER_SLOT - 1)
	nextSlotProgress: number;
	// Files still needed before a plugin can be installed again (0 while a slot is free)
	filesToInstall: number;
	limitReached: boolean;
}

export function getQuota(app: App): Quota {
	const filesCount = app.vault.getFiles().length;
	// Counts all installed community plugins, including disabled ones
	const pluginsCount = Object.keys(getManifests(app)).length;
	const limit = BASE_LIMIT + Math.floor(filesCount / FILES_PER_SLOT);
	const remaining = limit - pluginsCount;
	const nextSlotProgress = filesCount % FILES_PER_SLOT;
	const limitReached = pluginsCount >= limit;
	// Installing needs limit > pluginsCount, i.e. pluginsCount + 1 - BASE_LIMIT earned slots
	const filesToInstall = limitReached
		? (pluginsCount + 1 - BASE_LIMIT) * FILES_PER_SLOT - filesCount
		: 0;

	return {
		filesCount,
		pluginsCount,
		limit,
		remaining,
		nextSlotProgress,
		filesToInstall,
		limitReached,
	};
}
