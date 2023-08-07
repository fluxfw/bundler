/**
 * @typedef {{getLanguage: (module: string, language: string) => Promise<{direction: string}>, getLanguages: (module: string, exclude_system: boolean) => Promise<{all: {[key: string]: string}}>, translate: (module: string, key: string, placeholders: null, language: string) => Promise<string>}} Localization
 */
