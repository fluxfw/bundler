import { LOCALIZATION_MODULE_PWA_GENERATOR } from "../Localization/LOCALIZATION_MODULE.mjs";
import { writeFile } from "node:fs/promises";

/** @typedef {import("../FluxPwaGenerator.mjs").FluxPwaGenerator} FluxPwaGenerator */
/** @typedef {import("../Localization/Localization.mjs").Localization} Localization */

export class GenerateManifestJsons {
    /**
     * @type {FluxPwaGenerator}
     */
    #flux_pwa_generator;
    /**
     * @type {Localization | null}
     */
    #localization;

    /**
     * @param {FluxPwaGenerator} flux_pwa_generator
     * @param {Localization | null} localization
     * @returns {GenerateManifestJsons}
     */
    static new(flux_pwa_generator, localization = null) {
        return new this(
            flux_pwa_generator,
            localization
        );
    }

    /**
     * @param {FluxPwaGenerator} flux_pwa_generator
     * @param {Localization | null} localization
     * @private
     */
    constructor(flux_pwa_generator, localization) {
        this.#flux_pwa_generator = flux_pwa_generator;
        this.#localization = localization;
    }

    /**
     * @param {string} manifest_template_json_file
     * @param {string} manifest_json_file
     * @param {string | null} localization_folder
     * @returns {Promise<void>}
     */
    async generateManifestJsons(manifest_template_json_file, manifest_json_file, localization_folder = null) {
        if (localization_folder !== null) {
            if (this.#localization === null) {
                throw new Error("Missing Localization");
            }

            await this.#localization.addModule(
                localization_folder,
                LOCALIZATION_MODULE_PWA_GENERATOR
            );
        }

        const manifest = await this.#flux_pwa_generator.getManifest(
            manifest_template_json_file
        );

        const manifest_json_file_dot_pos = manifest_json_file.lastIndexOf(".");

        for (const language of [
            ...(localization_folder !== null ? Object.keys((await this.#localization.getLanguages(
                LOCALIZATION_MODULE_PWA_GENERATOR
            )).all) : null) ?? [],
            ""
        ]) {
            const localized_manifest_json_file = language !== "" ? `${manifest_json_file.substring(0, manifest_json_file_dot_pos)}-${language}${manifest_json_file.substring(manifest_json_file_dot_pos)}` : manifest_json_file;

            console.log(`Generate ${localized_manifest_json_file}`);

            const localized_manifest = structuredClone(manifest);

            const localized_manifest_language = language !== "" ? language : manifest.lang ?? "";

            for (const key of [
                "description",
                "name",
                "short_name"
            ]) {
                if (localization_folder !== null && localized_manifest_language !== "" && (localized_manifest[key] ?? "") !== "") {
                    localized_manifest[key] = await this.#localization.translate(
                        localized_manifest[key],
                        LOCALIZATION_MODULE_PWA_GENERATOR,
                        null,
                        localized_manifest_language
                    );
                }
            }

            if (localization_folder !== null && localized_manifest_language !== "") {
                localized_manifest.dir = (await this.#localization.getLanguage(
                    LOCALIZATION_MODULE_PWA_GENERATOR,
                    localized_manifest_language
                )).direction;
            }

            localized_manifest.lang = localized_manifest_language;

            await writeFile(localized_manifest_json_file, `${JSON.stringify(localized_manifest, null, 4)}
`);
        }
    }
}
