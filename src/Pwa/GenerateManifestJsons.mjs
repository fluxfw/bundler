import { readFile, writeFile } from "node:fs/promises";

/** @typedef {import("../../../flux-localization-api/src/FluxLocalizationApi.mjs").FluxLocalizationApi} FluxLocalizationApi */

export class GenerateManifestJsons {
    /**
     * @type {FluxLocalizationApi | null}
     */
    #flux_localization_api;

    /**
     * @param {FluxLocalizationApi | null} flux_localization_api
     * @returns {GenerateManifestJsons}
     */
    static new(flux_localization_api = null) {
        return new this(
            flux_localization_api
        );
    }

    /**
     * @param {FluxLocalizationApi | null} flux_localization_api
     * @private
     */
    constructor(flux_localization_api) {
        this.#flux_localization_api = flux_localization_api;
    }

    /**
     * @param {string} manifest_template_json_file
     * @param {string} manifest_json_file
     * @param {string | null} localization_folder
     * @returns {Promise<void>}
     */
    async generateManifestJsons(manifest_template_json_file, manifest_json_file, localization_folder = null) {
        if (localization_folder !== null) {
            if (this.#flux_localization_api === null) {
                throw new Error("Missing FluxLocalizationApi");
            }

            this.#flux_localization_api.addModule(
                localization_folder
            );
        }

        const manifest = JSON.parse(await readFile(manifest_template_json_file, "utf8"));

        const manifest_json_file_dot_pos = manifest_json_file.lastIndexOf(".");

        for (const language of [
            ...(localization_folder !== null ? Object.keys((await this.#flux_localization_api.getLanguages()).all) : null) ?? [],
            ""
        ]) {
            const localized_manifest = structuredClone(manifest);

            const localized_manifest_language = language !== "" ? language : manifest.lang ?? "";

            for (const key of [
                "description",
                "name",
                "short_name"
            ]) {
                localized_manifest[key] ??= "";

                if (localization_folder !== null && localized_manifest_language !== "" && localized_manifest[key] !== "") {
                    localized_manifest[key] = await this.#flux_localization_api.translate(
                        localized_manifest[key],
                        null,
                        null,
                        localized_manifest_language
                    );
                }
            }

            if (localization_folder !== null && localized_manifest_language !== "") {
                localized_manifest.dir = (await this.#flux_localization_api.getLanguage(
                    null,
                    localized_manifest_language
                )).direction;
            } else {
                localized_manifest.dir ??= "";
            }

            localized_manifest.lang = localized_manifest_language;

            await writeFile(language !== "" ? `${manifest_json_file.substring(0, manifest_json_file_dot_pos)}-${language}${manifest_json_file.substring(manifest_json_file_dot_pos)}` : manifest_json_file, `${JSON.stringify(localized_manifest, null, 4)}
`);
        }
    }
}
