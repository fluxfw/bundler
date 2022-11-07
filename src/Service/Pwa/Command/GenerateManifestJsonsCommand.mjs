import { writeFile } from "node:fs/promises";

/** @typedef {import("../../../../../flux-json-api/src/Adapter/Api/JsonApi.mjs").JsonApi} JsonApi */
/** @typedef {import("../../../../../flux-localization-api/src/Service/Localization/Port/LocalizationService.mjs").LocalizationService} LocalizationService */

export class GenerateManifestJsonsCommand {
    /**
     * @type {JsonApi}
     */
    #json_api;
    /**
     * @type {LocalizationService}
     */
    #localization_service;

    /**
     * @param {JsonApi} json_api
     * @param {LocalizationService} localization_service
     * @returns {GenerateManifestJsonsCommand}
     */
    static new(json_api, localization_service) {
        return new this(
            json_api,
            localization_service
        );
    }

    /**
     * @param {JsonApi} json_api
     * @param {LocalizationService} localization_service
     * @private
     */
    constructor(json_api, localization_service) {
        this.#json_api = json_api;
        this.#localization_service = localization_service;
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

        const available_languages = await this.#localization_service.importAvailableLanguagesJson(
            localization_folder
        );

        if (available_languages === null) {
            return;
        }

        for (const language of available_languages) {
            const localization = await this.#localization_service.importLocalizationJson(
                localization_folder,
                language
            );

            const localized_manifest = structuredClone(manifest);

            localized_manifest.description = this.#localization_service.translate(
                localized_manifest.description ?? "",
                {
                    localization
                }
            );

            localized_manifest.dir = await this.#localization_service.getDirection(
                {
                    language
                }
            );

            localized_manifest.lang = language;

            localized_manifest.name = this.#localization_service.translate(
                localized_manifest.name ?? "",
                {
                    localization
                }
            );

            localized_manifest.short_name = this.#localization_service.translate(
                localized_manifest.short_name ?? "",
                {
                    localization
                }
            );

            await writeFile(`${manifest_json_file.substring(0, manifest_json_file.lastIndexOf("."))}-${language}.json`, `${JSON.stringify(localized_manifest, null, 4)}
`);
        }
    }
}
