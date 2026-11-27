import { App, PluginManifest } from 'obsidian';


interface InternalPlugins {
	manifests: Record<string, PluginManifest>;
	enabledPlugins: Set<string>;
}

type InternalApp = App & {
	plugins?: InternalPlugins;
};

export function getPlugins(app: App): InternalPlugins | undefined {
	return (app as InternalApp).plugins;
}

export function getManifests(app: App): Record<string, PluginManifest> {
	return getPlugins(app)?.manifests ?? {};
}
