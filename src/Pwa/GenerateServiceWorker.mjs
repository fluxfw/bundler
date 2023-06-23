import { SKIP_WAITING } from "../../../flux-pwa-api/src/Pwa/SKIP_WAITING.mjs";
import { readFile, writeFile } from "node:fs/promises";

/** @typedef {import("./fileFilter.mjs").fileFilter} fileFilter */
/** @typedef {import("../FluxPwaGenerator.mjs").FluxPwaGenerator} FluxPwaGenerator */

export class GenerateServiceWorker {
    /**
     * @type {FluxPwaGenerator}
     */
    #flux_pwa_generator;

    /**
     * @param {FluxPwaGenerator} flux_pwa_generator
     * @returns {GenerateServiceWorker}
     */
    static new(flux_pwa_generator) {
        return new this(
            flux_pwa_generator
        );
    }

    /**
     * @param {FluxPwaGenerator} flux_pwa_generator
     * @private
     */
    constructor(flux_pwa_generator) {
        this.#flux_pwa_generator = flux_pwa_generator;
    }

    /**
     * @param {string} service_worker_template_mjs_file
     * @param {string} service_worker_mjs_file
     * @param {string} web_root
     * @param {string} application_cache_prefix
     * @param {{[key: string]: *} | null} data
     * @param {fileFilter | null} filter_filter
     * @param {boolean | null} ignore_jsdoc_files
     * @returns {Promise<void>}
     */
    async generateServiceWorker(service_worker_template_mjs_file, service_worker_mjs_file, web_root, application_cache_prefix, data = null, filter_filter = null, ignore_jsdoc_files = null) {
        console.log(`Generate ${service_worker_mjs_file}`);

        await writeFile(service_worker_mjs_file, "");

        const [
            files,
            ignored_file_filter_files,
            ignored_jsdoc_files
        ] = await this.#flux_pwa_generator.scanFiles(
            web_root,
            filter_filter,
            ignore_jsdoc_files
        );

        for (const file of ignored_file_filter_files) {
            console.log(`- Ignore ${file} from application cache files (File filter)`);
        }

        for (const file of ignored_jsdoc_files) {
            console.log(`- Ignore ${file} from application cache files (JSDoc file)`);
        }

        await writeFile(service_worker_mjs_file, (await readFile(service_worker_template_mjs_file, "utf8")).replaceAll("{ /*%DATA%*/ }", JSON.stringify({
            ...data,
            APPLICATION_CACHE_FILES: [
                ...filter_filter !== null && !filter_filter(
                    ""
                ) ? [] : [
                    ""
                ],
                ...files
            ],
            APPLICATION_CACHE_PREFIX: application_cache_prefix,
            APPLICATION_CACHE_VERSION: crypto.randomUUID(),
            SKIP_WAITING
        })));
    }
}
