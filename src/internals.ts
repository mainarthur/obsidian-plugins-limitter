import { App, Command, PluginManifest } from 'obsidian';


interface InternalPlugins {
	manifests: Record<string, PluginManifest>;
	enabledPlugins: Set<string>;
	disablePluginAndSave(id: string): Promise<void>;
	uninstallPlugin(id: string): Promise<void>;
}

interface InternalCommands {
	commands: Record<string, Command>;
	executeCommand(command: Command, event?: Event): boolean;
}

type InternalApp = App & {
	plugins?: InternalPlugins;
	commands?: InternalCommands;
};

export function getPlugins(app: App): InternalPlugins | undefined {
	return (app as InternalApp).plugins;
}

export function getCommands(app: App): InternalCommands | undefined {
	return (app as InternalApp).commands;
}

export function getManifests(app: App): Record<string, PluginManifest> {
	return getPlugins(app)?.manifests ?? {};
}
