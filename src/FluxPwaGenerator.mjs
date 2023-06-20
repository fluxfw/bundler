/** @typedef {import("./Pwa/fileFilter.mjs").fileFilter} fileFilter */
/** @typedef {import("../../flux-localization-api/src/FluxLocalizationApi.mjs").FluxLocalizationApi} FluxLocalizationApi */

export class FluxPwaGenerator {
    /**
     * @type {FluxLocalizationApi | null}
     */
    #flux_localization_api;

    /**
     * @param {FluxLocalizationApi | null} flux_localization_api
     * @returns {FluxPwaGenerator}
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
     * @param {string} index_template_html_file
     * @param {string} index_html_file
     * @param {string} manifest_json_file
     * @param {string | null} localization_folder
     * @returns {Promise<void>}
     */
    async generateIndexHtmls(index_template_html_file, index_html_file, manifest_json_file, localization_folder = null) {
        await (await import("./Pwa/GenerateIndexHtmls.mjs")).GenerateIndexHtmls.new(
            this.#flux_localization_api
        )
            .generateIndexHtmls(
                index_template_html_file,
                index_html_file,
                manifest_json_file,
                localization_folder
            );
    }

    /**
     * @param {string} manifest_template_json_file
     * @param {string} manifest_json_file
     * @param {string | null} localization_folder
     * @returns {Promise<void>}
     */
    async generateManifestJsons(manifest_template_json_file, manifest_json_file, localization_folder = null) {
        await (await import("./Pwa/GenerateManifestJsons.mjs")).GenerateManifestJsons.new(
            this.#flux_localization_api
        )
            .generateManifestJsons(
                manifest_template_json_file,
                manifest_json_file,
                localization_folder
            );
    }

    /**
     * @param {string} web_root
     * @param {string} service_worker_mjs_file
     * @param {string} application_cache_prefix
     * @param {string | null} service_worker_template_mjs_file
     * @param {{[key: string]: *} | null} data
     * @param {fileFilter | null} filter_filter
     * @param {boolean | null} ignore_jsdoc_files
     * @returns {Promise<void>}
     */
    async generateServiceWorker(web_root, service_worker_mjs_file, application_cache_prefix, service_worker_template_mjs_file = null, data = null, filter_filter = null, ignore_jsdoc_files = null) {
        await (await import("./Pwa/GenerateServiceWorker.mjs")).GenerateServiceWorker.new()
            .generateServiceWorker(
                web_root,
                service_worker_mjs_file,
                application_cache_prefix,
                service_worker_template_mjs_file,
                data,
                filter_filter,
                ignore_jsdoc_files
            );
    }
}
