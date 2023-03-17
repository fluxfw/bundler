/** @typedef {import("./Pwa/fileFilter.mjs").fileFilter} fileFilter */
/** @typedef {import("../../flux-localization-api/src/FluxLocalizationApi.mjs").FluxLocalizationApi} FluxLocalizationApi */
/** @typedef {import("./Pwa/Port/PwaService.mjs").PwaService} PwaService */

export class FluxPwaGenerator {
    /**
     * @type {FluxLocalizationApi | null}
     */
    #flux_localization_api;
    /**
     * @type {PwaService | null}
     */
    #pwa_service = null;

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
     * @param {string} manifest_json_file
     * @param {string} index_html_file
     * @param {string} web_manifest_json_file
     * @param {string} web_index_mjs_file
     * @param {string | null} localization_folder
     * @returns {Promise<void>}
     */
    async generateIndexHtmls(manifest_json_file, index_html_file, web_manifest_json_file, web_index_mjs_file, localization_folder = null) {
        await (await this.#getPwaService()).generateIndexHtmls(
            manifest_json_file,
            index_html_file,
            web_manifest_json_file,
            web_index_mjs_file,
            localization_folder
        );
    }

    /**
     * @param {string} manifest_json_file
     * @param {string} localization_folder
     * @returns {Promise<void>}
     */
    async generateManifestJsons(manifest_json_file, localization_folder) {
        await (await this.#getPwaService()).generateManifestJsons(
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
        await (await this.#getPwaService()).generateServiceWorker(
            web_root,
            service_worker_mjs_file,
            application_cache_prefix,
            service_worker_template_mjs_file,
            data,
            filter_filter,
            ignore_jsdoc_files
        );
    }

    /**
     * @returns {Promise<PwaService>}
     */
    async #getPwaService() {
        this.#pwa_service ??= (await import("./Pwa/Port/PwaService.mjs")).PwaService.new(
            this.#flux_localization_api
        );

        return this.#pwa_service;
    }
}
