/**
 * @typedef {{getLanguage: (module: string, language: string) => Promise<{direction: string}>, getLanguages: (module: string) => Promise<{all: {[key: string]: string}}>, translate: (module: string, key: string, placeholders: null, language: string) => Promise<string>}} Localization
 */
