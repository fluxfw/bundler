import { readFile, writeFile } from "node:fs/promises";

/** @typedef {import("../../../../../flux-localization-api/src/Adapter/Api/LocalizationApi.mjs").LocalizationApi} LocalizationApi */

export class GenerateManifestJsonsCommand {
    /**
     * @type {LocalizationApi}
     */
    #localization_api;

    /**
     * @param {LocalizationApi} localization_api
     * @returns {GenerateManifestJsonsCommand}
     */
    static new(localization_api) {
        return new this(
            localization_api
        );
    }

    /**
     * @param {LocalizationApi} localization_api
     * @private
     */
    constructor(localization_api) {
        this.#localization_api = localization_api;
    }

    /**
     * @param {string} manifest_json_file
     * @param {string} localization_folder
     * @returns {Promise<void>}
     */
    async generateManifestJsons(manifest_json_file, localization_folder) {
        const manifest = JSON.parse(await readFile(manifest_json_file, "utf8"));

        await this.#localization_api.addModule(
            localization_folder
        );

        const manifest_json_file_dot_pos = manifest_json_file.lastIndexOf(".");

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

            await writeFile(`${manifest_json_file.substring(0, manifest_json_file_dot_pos)}-${language}${manifest_json_file.substring(manifest_json_file_dot_pos)}`, `${JSON.stringify(localized_manifest, null, 4)}
`);
        }
    }
}
