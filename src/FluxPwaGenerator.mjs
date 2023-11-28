import { DeleteEmptyFoldersOrInvalidSymlinks } from "./Pwa/DeleteEmptyFoldersOrInvalidSymlinks.mjs";
import { DeleteExcludedFiles } from "./Pwa/DeleteExcludedFiles.mjs";
import { GenerateIcons } from "./Pwa/GenerateIcons.mjs";
import { GenerateIndexHtmls } from "./Pwa/GenerateIndexHtmls.mjs";
import { GenerateManifestJsons } from "./Pwa/GenerateManifestJsons.mjs";
import { GenerateServiceWorker } from "./Pwa/GenerateServiceWorker.mjs";
import { GetManifest } from "./Pwa/GetManifest.mjs";
import { ScanFiles } from "./Pwa/ScanFiles.mjs";

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
    async deleteEmptyFoldersOrInvalidSymlinks(root) {
        await DeleteEmptyFoldersOrInvalidSymlinks.new(
            this
        )
            .deleteEmptyFoldersOrInvalidSymlinks(
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
        await DeleteExcludedFiles.new(
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
        await GenerateIcons.new(
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
     * @param {string | null} localization_module
     * @returns {Promise<void>}
     */
    async generateIndexHtmls(index_template_html_file, index_html_file, manifest_json_file, localization_module = null) {
        await GenerateIndexHtmls.new(
            this,
            this.#localization
        )
            .generateIndexHtmls(
                index_template_html_file,
                index_html_file,
                manifest_json_file,
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
        await GenerateManifestJsons.new(
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
     * @param {string | null} application_cache_prefix
     * @param {{[key: string]: *} | null} data
     * @param {fileFilter | null} file_filter
     * @param {boolean | null} exclude_jsdoc_files
     * @returns {Promise<void>}
     */
    async generateServiceWorker(service_worker_template_mjs_file, service_worker_mjs_file, root, application_cache_prefix = null, data = null, file_filter = null, exclude_jsdoc_files = null) {
        await GenerateServiceWorker.new(
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
        return GetManifest.new()
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
        return ScanFiles.new()
            .scanFiles(
                root,
                file_filter,
                exclude_jsdoc_files
            );
    }
}
