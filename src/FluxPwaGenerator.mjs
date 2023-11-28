/** @typedef {import("./Pwa/fileFilter.mjs").fileFilter} fileFilter */
/** @typedef {import("./Pwa/getIconTemplateFile.mjs").getIconTemplateFile} getIconTemplateFile */
/** @typedef {import("./Localization/Localization.mjs").Localization} Localization */
/** @typedef {import("../../flux-pwa/src/Pwa/Manifest.mjs").Manifest} Manifest */

export class FluxPwaGenerator {
    /**
     * @type {Localization | null}
     */
    #localization;

    /**
     * @param {Localization | null} localization
     * @returns {FluxPwaGenerator}
     */
    static new(localization = null) {
        return new this(
            localization
        );
    }

    /**
     * @param {Localization | null} localization
     * @private
     */
    constructor(localization) {
        this.#localization = localization;
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
     * @param {string} web_index_mjs_file
     * @param {string | null} localization_module
     * @returns {Promise<void>}
     */
    async generateIndexHtmls(index_template_html_file, index_html_file, manifest_json_file, web_index_mjs_file, localization_module = null) {
        await (await import("./Pwa/GenerateIndexHtmls.mjs")).GenerateIndexHtmls.new(
            this,
            this.#localization
        )
            .generateIndexHtmls(
                index_template_html_file,
                index_html_file,
                manifest_json_file,
                web_index_mjs_file,
                localization_module
            );
    }

    /**
     * @param {Manifest} manifest_template
     * @param {string} manifest_json_file
     * @param {string | null} localization_module
     * @returns {Promise<void>}
     */
    async generateManifestJsons(manifest_template, manifest_json_file, localization_module = null) {
        await (await import("./Pwa/GenerateManifestJsons.mjs")).GenerateManifestJsons.new(
            this.#localization
        )
            .generateManifestJsons(
                manifest_template,
                manifest_json_file,
                localization_module
            );
    }

    /**
     * @param {string} service_worker_template_mjs_file
     * @param {string} service_worker_mjs_file
     * @param {string} root
     * @param {{[key: string]: *} | null} data
     * @param {fileFilter | null} file_filter
     * @param {boolean | null} exclude_jsdoc_files
     * @returns {Promise<void>}
     */
    async generateServiceWorker(service_worker_template_mjs_file, service_worker_mjs_file, root, data = null, file_filter = null, exclude_jsdoc_files = null) {
        await (await import("./Pwa/GenerateServiceWorker.mjs")).GenerateServiceWorker.new(
            this
        )
            .generateServiceWorker(
                service_worker_template_mjs_file,
                service_worker_mjs_file,
                root,
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
