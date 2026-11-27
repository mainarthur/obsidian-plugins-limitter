import { App, PluginManifest, Setting } from 'obsidian';
import { t } from './i18n';
import { getManifests, getPlugins } from './internals';
import { BASE_LIMIT, FILES_PER_SLOT, Quota } from './quota';

// One row of the settings tab. Both render paths in settings.ts use it.
export interface DashboardItem {
	name: string;
	desc?: string;
	render?: (setting: Setting) => void;
}

export interface DashboardSection {
	heading: string;
	items: DashboardItem[];
}

const TONES = ['success', 'warning', 'error'] as const;
type Tone = typeof TONES[number];
type PillTone = Tone | 'neutral';

// Changes whenever anything the dashboard shows changes
export function dashboardKey(app: App, quota: Quota): string {
	const enabled = getPlugins(app)?.enabledPlugins ?? new Set<string>();
	const plugins = Object.keys(getManifests(app))
		.sort()
		.map(id => (enabled.has(id) ? `+${id}` : `-${id}`));
	return `${String(quota.filesCount)}|${plugins.join(',')}`;
}

// Rows render nothing in controlEl, so Obsidian hides it and the info column
// (with its bar or chips) spans the full row. Obsidian sets the name and desc
// before calling render, so pills and bars added here survive.
// On Obsidian 1.13+, update() keeps the rendered rows and calls render on them
// again, so each helper first removes what an earlier render added.
function removeOwn(parent: HTMLElement, cls: string) {
	parent.querySelector(`:scope > .${cls}`)?.remove();
}

function addPill(setting: Setting, text: string, tone: PillTone) {
	removeOwn(setting.nameEl, 'plugins-limitter-pill');
	setting.nameEl.createSpan({ cls: ['plugins-limitter-pill', `mod-${tone}`], text });
}

function addBar(setting: Setting, value: number, max: number, tone?: Tone) {
	removeOwn(setting.infoEl, 'plugins-limitter-bar');
	const bar = createDiv({
		cls: 'plugins-limitter-bar',
		attr: {
			role: 'progressbar',
			'aria-valuemin': 0,
			'aria-valuemax': max,
			'aria-valuenow': value,
		},
	});
	bar.setCssProps({ '--plugins-limitter-fill': `${String(Math.round((value / max) * 100))}%` });
	if (tone) {
		bar.addClass(`mod-${tone}`);
	}
	bar.createDiv({ cls: 'plugins-limitter-bar-fill' });
	setting.infoEl.insertBefore(bar, setting.descEl);
}

// At the limit is a warning (nothing to fix, just no room); over it is an error
function slotsPill({ remaining }: Quota): { text: string; tone: Tone } {
	if (remaining > 0) {
		return { text: t('SLOTS_FREE', { count: remaining }), tone: 'success' };
	}
	if (remaining === 0) {
		return { text: t('SLOTS_FULL'), tone: 'warning' };
	}
	return { text: t('SLOTS_OVER', { count: -remaining }), tone: 'error' };
}

export function slotsSection(quota: Quota): DashboardSection {
	const { filesCount, pluginsCount, limit, remaining, nextSlotProgress, filesToInstall, limitReached } = quota;

	return {
		heading: t('SLOTS_TITLE'),
		items: [
			{
				name: t('SLOTS_USED', { used: pluginsCount, limit }),
				desc: limitReached
					? t('QUOTA_LOCKED', { files: filesToInstall })
					: t('QUOTA_SUCCESS', { remaining }),
				render: (setting: Setting) => {
					const pill = slotsPill(quota);
					addPill(setting, pill.text, pill.tone);
					// Success keeps the bar in the accent color
					addBar(setting, Math.min(pluginsCount, limit), limit, pill.tone === 'success' ? undefined : pill.tone);
					for (const tone of TONES) {
						setting.descEl.toggleClass(`plugins-limitter-quota-${tone}`, tone === pill.tone);
					}
				},
			},
			{
				name: t('NEXT_SLOT'),
				desc: t('FILES_DESC', { count: filesCount, base: BASE_LIMIT, perSlot: FILES_PER_SLOT }),
				render: (setting: Setting) => {
					addPill(setting, t('NEXT_SLOT_PROGRESS', { files: nextSlotProgress, perSlot: FILES_PER_SLOT }), 'neutral');
					addBar(setting, nextSlotProgress, FILES_PER_SLOT);
				},
			},
		],
	};
}

function renderChips(names: string[], disabled: boolean) {
	return (setting: Setting) => {
		// Kept out of descEl so setDesc can't wipe the chips
		removeOwn(setting.infoEl, 'plugins-limitter-chips');
		const chips = setting.infoEl.createDiv({ cls: 'plugins-limitter-chips' });
		for (const name of names) {
			const chip = chips.createSpan({ cls: 'plugins-limitter-chip', text: name });
			chip.toggleClass('is-disabled', disabled);
		}
	};
}

export function pluginsSection(app: App): DashboardSection {
	const manifests = getManifests(app);
	const enabled = getPlugins(app)?.enabledPlugins ?? new Set<string>();

	const installed = Object.keys(manifests)
		.map(id => manifests[id])
		.filter((manifest): manifest is PluginManifest => manifest !== undefined)
		.sort((a, b) => a.name.localeCompare(b.name));
	const enabledNames = installed.filter(m => enabled.has(m.id)).map(m => m.name);
	const disabledNames = installed.filter(m => !enabled.has(m.id)).map(m => m.name);

	const items: DashboardItem[] = [];
	if (enabledNames.length > 0) {
		items.push({
			name: t('PLUGINS_ENABLED', { count: enabledNames.length }),
			render: renderChips(enabledNames, false),
		});
	}
	if (disabledNames.length > 0) {
		items.push({
			name: t('PLUGINS_DISABLED', { count: disabledNames.length }),
			render: renderChips(disabledNames, true),
		});
	}
	if (items.length === 0) {
		items.push({ name: t('PLUGINS_NONE') });
	}

	return {
		heading: t('PLUGINS_LIST_TITLE', { count: installed.length }),
		items,
	};
}
