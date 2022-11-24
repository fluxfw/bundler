/** @typedef {import("../../../../flux-json-api/src/Adapter/Api/JsonApi.mjs").JsonApi} JsonApi */
/** @typedef {import("../../../../flux-localization-api/src/Adapter/Api/LocalizationApi.mjs").LocalizationApi} LocalizationApi */
/** @typedef {import("../../Service/Pwa/Port/PwaService.mjs").PwaService} PwaService */

export class PwaGeneratorApi {
    /**
     * @type {JsonApi}
     */
    #json_api;
    /**
     * @type {LocalizationApi | null}
     */
    #localization_api;
    /**
     * @type {PwaService | null}
     */
    #pwa_service = null;

    /**
     * @param {JsonApi} json_api
     * @param {LocalizationApi | null} localization_api
     * @returns {PwaGeneratorApi}
     */
    static new(json_api, localization_api = null) {
        return new this(
            json_api,
            localization_api
        );
    }

    /**
     * @param {JsonApi} json_api
     * @param {LocalizationApi | null} localization_api
     * @private
     */
    constructor(json_api, localization_api) {
        this.#json_api = json_api;
        this.#localization_api = localization_api;
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
     * @param {string} service_worker_template_mjs_file
     * @param {string} service_worker_mjs_file
     * @param {{[key: string]: *}} data
     * @returns {Promise<void>}
     */
    async generateServiceWorker(web_root, service_worker_template_mjs_file, service_worker_mjs_file, data) {
        await (await this.#getPwaService()).generateServiceWorker(
            web_root,
            service_worker_template_mjs_file,
            service_worker_mjs_file,
            data
        );
    }

    /**
     * @returns {Promise<PwaService>}
     */
    async #getPwaService() {
        this.#pwa_service ??= (await import("../../Service/Pwa/Port/PwaService.mjs")).PwaService.new(
            this.#json_api,
            this.#localization_api
        );

        return this.#pwa_service;
    }
}
