import { writeFile } from "node:fs/promises";

/** @typedef {import("../../../../../flux-json-api/src/Adapter/Api/JsonApi.mjs").JsonApi} JsonApi */
/** @typedef {import("../../../../../flux-localization-api/src/Adapter/Api/LocalizationApi.mjs").LocalizationApi} LocalizationApi */

export class GenerateManifestJsonsCommand {
    /**
     * @type {JsonApi}
     */
    #json_api;
    /**
     * @type {LocalizationApi}
     */
    #localization_api;

    /**
     * @param {JsonApi} json_api
     * @param {LocalizationApi} localization_api
     * @returns {GenerateManifestJsonsCommand}
     */
    static new(json_api, localization_api) {
        return new this(
            json_api,
            localization_api
        );
    }

    /**
     * @param {JsonApi} json_api
     * @param {LocalizationApi} localization_api
     * @private
     */
    constructor(json_api, localization_api) {
        this.#json_api = json_api;
        this.#localization_api = localization_api;
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

        await this.#localization_api.addModule(
            localization_folder
        );

        for (const language of Object.keys((await this.#localization_api.getLanguages()).all)) {
            const localized_manifest = structuredClone(manifest);

            localized_manifest.description = await this.#localization_api.translate(
                localized_manifest.description ?? "",
                null,
                null,
                language
            );

            localized_manifest.dir = (await this.#localization_api.getLanguage(
                null,
                language
            )).direction;

            localized_manifest.lang = language;

            localized_manifest.name = await this.#localization_api.translate(
                localized_manifest.name ?? "",
                null,
                null,
                language
            );

            localized_manifest.short_name = await this.#localization_api.translate(
                localized_manifest.short_name ?? "",
                null,
                null,
                language
            );

            await writeFile(`${manifest_json_file.substring(0, manifest_json_file.lastIndexOf("."))}-${language}.json`, `${JSON.stringify(localized_manifest, null, 4)}
`);
        }
    }
}
