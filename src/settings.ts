import { App, PluginSettingTab, Setting } from "obsidian";
import ObsidianPluginsLimitter from "./main";
import { t } from "./i18n";

export class ObsidianPluginsSettingTab extends PluginSettingTab {
	plugin: ObsidianPluginsLimitter;

	constructor(app: App, plugin: ObsidianPluginsLimitter) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName(t('STATS_TITLE')).setHeading();

		const filesCount = this.app.vault.getFiles().length;
		const pluginsCount = Object.keys((this.app as App & { plugins?: { manifests?: Record<string, unknown> } }).plugins?.manifests || {}).length;
		const limit = 5 + Math.floor(filesCount / 10);
		const remaining = limit - pluginsCount;
		const nextMilestone = 10 - (filesCount % 10);

		new Setting(containerEl)
			.setName(t('FILE_COUNT_LABEL'))
			.setDesc(t('FILE_COUNT_DESC'))
			.addText(text => text
				.setValue(filesCount.toString())
				.setDisabled(true)
			);

		new Setting(containerEl)
			.setName(t('PLUGINS_COUNT_LABEL'))
			.setDesc(t('PLUGINS_COUNT_DESC'))
			.addText(text => text
				.setValue(pluginsCount.toString())
				.setDisabled(true)
			);

		new Setting(containerEl)
			.setName(t('ALLOWANCE_LABEL'))
			.setDesc(t('ALLOWANCE_DESC'))
			.addText(text => text
				.setValue(limit.toString())
				.setDisabled(true)
			);

		const quotaEl = containerEl.createEl('div', { cls: 'setting-item-description' });
		if (remaining > 0) {
			quotaEl.setText(t('QUOTA_SUCCESS', { remaining }));
			quotaEl.setCssProps({ color: 'var(--text-success)' });
		} else {
			quotaEl.setText(t('QUOTA_ERROR', { nextMilestone }));
			quotaEl.setCssProps({ color: 'var(--text-error)' });
		}

		containerEl.createEl('br');
		containerEl.createEl('p', {
			text: t('FOOTER_MSG', { nextMilestone }),
			cls: 'setting-item-description'
		});
	}
}
