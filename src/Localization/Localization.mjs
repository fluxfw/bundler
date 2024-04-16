/**
 * @typedef {{getLanguage: (language: string) => Promise<{direction: string}>, getLanguages: (exclude_system: boolean) => Promise<{[key: string]: string}>, translate: (module: string, key: string, placeholders: null, language: string) => Promise<string>}} Localization
 */
