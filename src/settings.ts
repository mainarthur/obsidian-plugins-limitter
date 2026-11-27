import { App, PluginSettingTab, requireApiVersion, Setting, SettingDefinitionItem } from "obsidian";
import ObsidianPluginsLimitter from "./main";
import { getQuota, Quota } from "./quota";
import { dashboardKey, DashboardSection, pluginsSection, slotsSection } from "./dashboard";

export class ObsidianPluginsSettingTab extends PluginSettingTab {
	plugin: ObsidianPluginsLimitter;
	// Data the current definitions were built from, see refreshIfChanged()
	private builtFrom = '';

	constructor(app: App, plugin: ObsidianPluginsLimitter) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private buildSections(): DashboardSection[] {
		const quota = getQuota(this.app);
		this.builtFrom = dashboardKey(this.app, quota);
		return [
			slotsSection(quota),
			pluginsSection(this.app),
		];
	}

	// Obsidian 1.13+ builds the definitions once (in addSettingTab) and re-renders
	// that cached copy every time the tab opens, until update() is called.
	// Rebuild them whenever files or plugins changed; an open tab re-renders live.
	refreshIfChanged(quota: Quota): void {
		// Older versions call display() on every open, so they're always fresh
		if (!requireApiVersion('1.13.0')) {
			return;
		}
		if (dashboardKey(this.app, quota) !== this.builtFrom) {
			this.update();
		}
	}

	// Obsidian 1.13+ renders the tab from these definitions
	override getSettingDefinitions(): SettingDefinitionItem[] {
		return this.buildSections().map((section): SettingDefinitionItem => ({
			type: 'group',
			heading: section.heading,
			items: section.items.map(item => ({
				name: item.name,
				desc: item.desc,
				render: (setting: Setting) => item.render?.(setting),
			})),
		}));
	}

	// Fallback for Obsidian older than 1.13
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		for (const section of this.buildSections()) {
			new Setting(containerEl).setName(section.heading).setHeading();

			for (const item of section.items) {
				const setting = new Setting(containerEl).setName(item.name);
				if (item.desc) {
					setting.setDesc(item.desc);
				}
				item.render?.(setting);
			}
		}
	}
}
