import { Plugin, App } from 'obsidian';
import { ObsidianPluginsSettingTab } from './settings';
import { t } from './i18n';

export default class ObsidianPluginsLimitter extends Plugin {

	onload() {
		// Run it initially after layout is ready
		this.app.workspace.onLayoutReady(() => {
			this.checkPluginsLimit();
		});

		// Check every 1 second continuously to catch modals and settings tabs being opened
		this.registerInterval(
			window.setInterval(() => this.checkPluginsLimit(), 1000)
		);

		this.addSettingTab(new ObsidianPluginsSettingTab(this.app, this));
	}

	onunload() {
		// Restore any disabled buttons
		document.querySelectorAll('button[data-plugins-disabled]').forEach(btn => {
			btn.removeAttribute('disabled');
			btn.removeAttribute('data-plugins-disabled');

			const originalTitle = btn.getAttribute('data-original-title') || '';
			btn.setAttribute('aria-label', originalTitle);
			btn.setAttribute('title', originalTitle);

			const originalText = btn.getAttribute('data-original-text') || '';
			if (originalText) {
				btn.textContent = originalText;
			}

			if (!originalTitle) {
				btn.removeAttribute('aria-label');
				btn.removeAttribute('title');
			}
		});
		document.body.classList.remove('obsidian-plugins-limit-reached');
	}

	checkPluginsLimit() {
		const filesCount = this.app.vault.getFiles().length;
		// Count all installed community plugins
		const pluginsCount = Object.keys((this.app as App & { plugins?: { manifests?: Record<string, unknown> } }).plugins?.manifests || {}).length;
		const limit = 5 + Math.floor(filesCount / 10);
		const limitReached = pluginsCount >= limit;

		// Add a class for potential CSS styling
		document.body.classList.toggle('obsidian-plugins-limit-reached', limitReached);

		const buttons = document.querySelectorAll('button');
		buttons.forEach(btn => {
			// Find "Browse" button in settings. 
			const isBrowseBtn = btn.getAttribute('aria-label') === "Browse community plugins" ||
				(btn.parentElement?.classList.contains('setting-item-control') &&
					btn.closest('.setting-item')?.querySelector('.setting-item-name')?.textContent?.toLowerCase().includes('community plugins'));

			// Find "Install" button in the plugin browser modal
			const isInstallBtn = (btn.textContent?.trim().toLowerCase() === 'install' || btn.getAttribute('data-plugins-disabled') === 'true') && btn.closest('.modal');

			if (isBrowseBtn || isInstallBtn) {
				if (limitReached) {
					if (!btn.hasAttribute('disabled')) {
						btn.setAttribute('disabled', 'true');
						btn.setAttribute('data-plugins-disabled', 'true');

						const originalTitle = btn.getAttribute('aria-label') || btn.title || '';
						if (!btn.hasAttribute('data-original-title')) {
							btn.setAttribute('data-original-title', originalTitle);
						}

						const msg = t('LIMIT_MSG');
						btn.setAttribute('aria-label', msg);
						btn.setAttribute('title', msg);

						const originalText = btn.textContent || "";
						if (!btn.hasAttribute('data-original-text')) {
							btn.setAttribute('data-original-text', originalText);
						}
						btn.textContent = t('LIMIT_REACHED_BTN');
					}
				} else {
					if (btn.hasAttribute('data-plugins-disabled')) {
						btn.removeAttribute('disabled');
						btn.removeAttribute('data-plugins-disabled');

						const originalTitle = btn.getAttribute('data-original-title') || '';
						btn.setAttribute('aria-label', originalTitle);
						btn.setAttribute('title', originalTitle);

						const originalText = btn.getAttribute('data-original-text') || '';
						if (originalText) {
							btn.textContent = originalText;
						}

						if (!originalTitle) {
							btn.removeAttribute('aria-label');
							btn.removeAttribute('title');
						}
					}
				}
			}
		});
	}
}
