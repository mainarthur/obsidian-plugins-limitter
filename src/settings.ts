import { App, PluginSettingTab, Setting, SettingDefinitionItem } from "obsidian";
import ObsidianPluginsLimitter from "./main";
import { t } from "./i18n";

export class ObsidianPluginsSettingTab extends PluginSettingTab {
	plugin: ObsidianPluginsLimitter;

	constructor(app: App, plugin: ObsidianPluginsLimitter) {
		super(app, plugin);
		this.plugin = plugin;
	}

	override getSettingDefinitions(): SettingDefinitionItem[] {
		const filesCount = this.app.vault.getFiles().length;
		const pluginsCount = Object.keys((this.app as App & { plugins?: { manifests?: Record<string, unknown> } }).plugins?.manifests || {}).length;
		const limit = 5 + Math.floor(filesCount / 10);
		const remaining = limit - pluginsCount;
		const nextMilestone = 10 - (filesCount % 10);

		return [
			{
				type: 'group',
				heading: t('STATS_TITLE'),
				items: [
					{
						name: t('FILE_COUNT_LABEL'),
						desc: t('FILE_COUNT_DESC'),
						render: (setting: Setting) => {
							setting.addText(text => text
								.setValue(filesCount.toString())
								.setDisabled(true)
							);
						}
					},
					{
						name: t('PLUGINS_COUNT_LABEL'),
						desc: t('PLUGINS_COUNT_DESC'),
						render: (setting: Setting) => {
							setting.addText(text => text
								.setValue(pluginsCount.toString())
								.setDisabled(true)
							);
						}
					},
					{
						name: t('ALLOWANCE_LABEL'),
						desc: t('ALLOWANCE_DESC'),
						render: (setting: Setting) => {
							setting.addText(text => text
								.setValue(limit.toString())
								.setDisabled(true)
							);
						}
					},
					{
						name: remaining > 0
							? t('QUOTA_SUCCESS', { remaining })
							: t('QUOTA_ERROR', { nextMilestone }),
						desc: t('FOOTER_MSG', { nextMilestone }),
						render: (setting: Setting) => {
							setting.nameEl.addClass(
								remaining > 0 ? 'plugins-limitter-quota-success' : 'plugins-limitter-quota-error'
							);
						}
					}
				]
			}
		];
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

		const quotaEl = containerEl.createDiv({ cls: 'setting-item-description' });
		if (remaining > 0) {
			quotaEl.setText(t('QUOTA_SUCCESS', { remaining }));
			quotaEl.addClass('plugins-limitter-quota-success');
		} else {
			quotaEl.setText(t('QUOTA_ERROR', { nextMilestone }));
			quotaEl.addClass('plugins-limitter-quota-error');
		}

		containerEl.createEl('br');
		containerEl.createEl('p', {
			text: t('FOOTER_MSG', { nextMilestone }),
			cls: 'setting-item-description'
		});
	}
}
