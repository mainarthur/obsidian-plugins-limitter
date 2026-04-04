import { moment } from "obsidian";

import en from "./locale/en.json";
import de from "./locale/de.json";
import es from "./locale/es.json";
import fr from "./locale/fr.json";
import it from "./locale/it.json";
import ja from "./locale/ja.json";
import ko from "./locale/ko.json";
import pt from "./locale/pt.json";
import ru from "./locale/ru.json";
import zh from "./locale/zh.json";
import ar from "./locale/ar.json";
import id from "./locale/id.json";
import tr from "./locale/tr.json";
import pl from "./locale/pl.json";
import uk from "./locale/uk.json";
import vi from "./locale/vi.json";
import th from "./locale/th.json";
import nl from "./locale/nl.json";
import cs from "./locale/cs.json";
import hi from "./locale/hi.json";

const localeMap: { [k: string]: any } = {
	en, de, es, fr, it, ja, ko, pt, ru, zh, ar, id, tr, pl, uk, vi, th, nl, cs, hi
};

const locale = moment.locale();
export const t = (key: keyof typeof en, vars?: { [k: string]: string | number }): string => {
	const currentLocale = localeMap[locale] || localeMap[locale.substring(0, 2)] || en;
	let text = (currentLocale as any)[key] || (en as any)[key] || key;

	if (vars) {
		for (const v in vars) {
			text = text.replace(`{{${v}}}`, vars[v].toString());
		}
	}

	return text;
};
