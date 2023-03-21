import { readFile, writeFile } from "node:fs/promises";

/** @typedef {import("../../../flux-localization-api/src/FluxLocalizationApi.mjs").FluxLocalizationApi} FluxLocalizationApi */

export class GenerateManifestJsons {
    /**
     * @type {FluxLocalizationApi}
     */
    #flux_localization_api;

    /**
     * @param {FluxLocalizationApi} flux_localization_api
     * @returns {GenerateManifestJsons}
     */
    static new(flux_localization_api) {
        return new this(
            flux_localization_api
        );
    }

    /**
     * @param {FluxLocalizationApi} flux_localization_api
     * @private
     */
    constructor(flux_localization_api) {
        this.#flux_localization_api = flux_localization_api;
    }

    /**
     * @param {string} manifest_json_file
     * @param {string} localization_folder
     * @returns {Promise<void>}
     */
    async generateManifestJsons(manifest_json_file, localization_folder) {
        const manifest = JSON.parse(await readFile(manifest_json_file, "utf8"));

        this.#flux_localization_api.addModule(
            localization_folder
        );

        const manifest_json_file_dot_pos = manifest_json_file.lastIndexOf(".");

        for (const language of Object.keys((await this.#flux_localization_api.getLanguages()).all)) {
            const localized_manifest = structuredClone(manifest);

            localized_manifest.description = await this.#flux_localization_api.translate(
                localized_manifest.description ?? "",
                null,
                null,
                language
            );

            localized_manifest.dir = (await this.#flux_localization_api.getLanguage(
                null,
                language
            )).direction;

            localized_manifest.lang = language;

            localized_manifest.name = await this.#flux_localization_api.translate(
                localized_manifest.name ?? "",
                null,
                null,
                language
            );

            localized_manifest.short_name = await this.#flux_localization_api.translate(
                localized_manifest.short_name ?? "",
                null,
                null,
                language
            );

            await writeFile(`${manifest_json_file.substring(0, manifest_json_file_dot_pos)}-${language}${manifest_json_file.substring(manifest_json_file_dot_pos)}`, `${JSON.stringify(localized_manifest, null, 4)}
`);
        }
    }
}
