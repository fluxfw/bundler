/**
 * @typedef {{addModule: (folder: string, module: string) => Promise<void>, getLanguage: (module: string, language: string) => Promise<{direction: string}>, getLanguages: (module: string) => Promise<{all: {[key: string]: string}}>, translate: (text: string, module: string, placeholders: null, language: string) => Promise<string>}} Localization
 */
