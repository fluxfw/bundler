/** @typedef {import("./Pwa/fileFilter.mjs").fileFilter} fileFilter */
/** @typedef {import("./Pwa/getIconTemplateFile.mjs").getIconTemplateFile} getIconTemplateFile */
/** @typedef {import("../../flux-localization-api/src/FluxLocalizationApi.mjs").FluxLocalizationApi} FluxLocalizationApi */
/** @typedef {import("../../flux-pwa-api/src/Pwa/Manifest.mjs").Manifest} Manifest */

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
     * @param {string} root
     * @returns {Promise<void>}
     */
    async deleteEmptyFolders(root) {
        await (await import("./Pwa/DeleteEmptyFolders.mjs")).DeleteEmptyFolders.new(
            this
        )
            .deleteEmptyFolders(
                root
            );
    }

    /**
     * @param {string} root
     * @param {fileFilter | null} file_filter
     * @param {boolean | null} exclude_jsdoc_files
     * @returns {Promise<void>}
     */
    async deleteExcludedFiles(root, file_filter = null, exclude_jsdoc_files = null) {
        await (await import("./Pwa/DeleteExcludedFiles.mjs")).DeleteExcludedFiles.new(
            this
        )
            .deleteExcludedFiles(
                root,
                file_filter,
                exclude_jsdoc_files
            );
    }

    /**
     * @param {getIconTemplateFile | string} get_icon_template_file
     * @param {string} manifest_json_file
     * @returns {Promise<void>}
     */
    async generateIcons(get_icon_template_file, manifest_json_file) {
        await (await import("./Pwa/GenerateIcons.mjs")).GenerateIcons.new(
            this
        )
            .generateIcons(
                get_icon_template_file,
                manifest_json_file
            );
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
            this,
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
            this,
            this.#flux_localization_api
        )
            .generateManifestJsons(
                manifest_template_json_file,
                manifest_json_file,
                localization_folder
            );
    }

    /**
     * @param {string} service_worker_template_mjs_file
     * @param {string} service_worker_mjs_file
     * @param {string} root
     * @param {string} application_cache_prefix
     * @param {{[key: string]: *} | null} data
     * @param {fileFilter | null} file_filter
     * @param {boolean | null} exclude_jsdoc_files
     * @returns {Promise<void>}
     */
    async generateServiceWorker(service_worker_template_mjs_file, service_worker_mjs_file, root, application_cache_prefix, data = null, file_filter = null, exclude_jsdoc_files = null) {
        await (await import("./Pwa/GenerateServiceWorker.mjs")).GenerateServiceWorker.new(
            this
        )
            .generateServiceWorker(
                service_worker_template_mjs_file,
                service_worker_mjs_file,
                root,
                application_cache_prefix,
                data,
                file_filter,
                exclude_jsdoc_files
            );
    }

    /**
     * @param {string} manifest_json_file
     * @returns {Promise<Manifest>}
     */
    async getManifest(manifest_json_file) {
        return (await import("./Pwa/GetManifest.mjs")).GetManifest.new()
            .getManifest(
                manifest_json_file
            );
    }

    /**
     * @param {string} root
     * @param {fileFilter | null} file_filter
     * @param {boolean | null} exclude_jsdoc_files
     * @returns {Promise<string[][]>}
     */
    async scanFiles(root, file_filter = null, exclude_jsdoc_files = null) {
        return (await import("./Pwa/ScanFiles.mjs")).ScanFiles.new()
            .scanFiles(
                root,
                file_filter,
                exclude_jsdoc_files
            );
    }
}
