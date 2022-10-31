import { writeFile } from "node:fs/promises";

/** @typedef {import("../../../../../flux-json-api/src/Adapter/Api/JsonApi.mjs").JsonApi} JsonApi */

export class GenerateManifestJsonsCommand {
    /**
     * @type {JsonApi}
     */
    #json_api;

    /**
     * @param {JsonApi} json_api
     * @returns {GenerateManifestJsonsCommand}
     */
    static new(json_api) {
        return new this(
            json_api
        );
    }

    /**
     * @param {JsonApi} json_api
     * @private
     */
    constructor(json_api) {
        this.#json_api = json_api;
    }

    /**
     * @param {string} manifest_json_file
     * @param {string} localization_folder
     * @returns {Promise<void>}
     */
    async generateManifestJsons(manifest_json_file, localization_folder) {
        const manifest = await this.#json_api.importJson(
            manifest_json_file
        );

        const available_languages = await this.#importAvailableLanguagesJson(
            localization_folder
        );

        if (available_languages === null) {
            return;
        }

        for (const language of available_languages) {
            const localization = await this.#importLocalizationJson(
                localization_folder,
                language
            );

            const localized_manifest = structuredClone(manifest);

            localized_manifest.description = await this.#translate(
                localized_manifest.description ?? "",
                localization
            );

            localized_manifest.dir = await this.#getDirection(
                language
            );

            localized_manifest.lang = language;

            localized_manifest.name = await this.#translate(
                localized_manifest.name ?? "",
                localization
            );

            localized_manifest.short_name = await this.#translate(
                localized_manifest.short_name ?? "",
                localization
            );

            await writeFile(`${manifest_json_file.substring(0, manifest_json_file.lastIndexOf("."))}-${language}.json`, `${JSON.stringify(localized_manifest, null, 4)}
`);
        }
    }

    /**
     * @param {string | null} language
     * @returns {Promise<string>}
     */
    async #getDirection(language = null) {
        return (await import("../../../../../flux-localization-api/src/Service/Localization/Command/GetDirectionCommand.mjs")).GetDirectionCommand.new()
            .getDirection(
                {
                    language
                }
            );
    }

    /**
     * @param {string} localization_folder
     * @returns {Promise<string[] | null>}
     */
    async #importAvailableLanguagesJson(localization_folder) {
        return (await import("../../../../../flux-localization-api/src/Service/Localization/Command/ImportAvailableLanguagesJsonCommand.mjs")).ImportAvailableLanguagesJsonCommand.new(
            this.#json_api
        )
            .importAvailableLanguagesJson(
                localization_folder
            );
    }

    /**
     * @param {string} localization_folder
     * @param {string} language
     * @returns {Promise<{[key: string]: string} | null>}
     */
    async #importLocalizationJson(localization_folder, language) {
        return (await import("../../../../../flux-localization-api/src/Service/Localization/Command/ImportLocalizationJsonCommand.mjs")).ImportLocalizationJsonCommand.new(
            this.#json_api
        )
            .importLocalizationJson(
                localization_folder,
                language
            );
    }

    /**
     * @param {string} text
     * @param {{[key: string]: string} | null} localization
     * @param {{[key: string]: string} | null} placeholders
     * @returns {Promise<string>}
     */
    async #translate(text, localization = null, placeholders = null) {
        return (await import("../../../../../flux-localization-api/src/Service/Localization/Command/TranslateCommand.mjs")).TranslateCommand.new()
            .translate(
                text,
                {
                    localization
                },
                placeholders
            );
    }
}
