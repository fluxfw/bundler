import { DeleteEmptyFolders } from "./Pwa/DeleteEmptyFolders.mjs";
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
/** @typedef {import("../../flux-pwa-api/src/Pwa/Manifest.mjs").Manifest} Manifest */

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
        await DeleteEmptyFolders.new(
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
     * @param {string | null} localization_folder
     * @returns {Promise<void>}
     */
    async generateIndexHtmls(index_template_html_file, index_html_file, manifest_json_file, localization_folder = null) {
        await GenerateIndexHtmls.new(
            this,
            this.#localization
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
        await GenerateManifestJsons.new(
            this,
            this.#localization
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
