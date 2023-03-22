import { fileURLToPath } from "node:url";
import { SKIP_WAITING } from "../../../flux-pwa-api/src/Pwa/SKIP_WAITING.mjs";
import { dirname, extname, join, relative } from "node:path/posix";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";

/** @typedef {import("./fileFilter.mjs").fileFilter} fileFilter */

export class GenerateServiceWorker {
    /**
     * @returns {GenerateServiceWorker}
     */
    static new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {

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
        await writeFile(service_worker_mjs_file, "");

        await writeFile(service_worker_mjs_file, (await readFile(service_worker_template_mjs_file ?? join(dirname(fileURLToPath(import.meta.url)), "service-worker-template.mjs"), "utf8")).replaceAll("{ /*%DATA%*/ }", JSON.stringify({
            ...data,
            APPLICATION_CACHE_FILES: [
                ...filter_filter !== null && !filter_filter(
                    ""
                ) ? [] : [
                    ""
                ],
                ...await (async function scanFiles(folder) {
                    const files = [];

                    for (const file of await readdir(folder)) {
                        const _file = join(folder, file);

                        const _stat = await stat(_file);

                        if (_stat.isDirectory()) {
                            files.push(...await scanFiles(
                                _file
                            ));
                        } else {
                            const web_root_file = relative(web_root, _file);

                            if (filter_filter !== null && !filter_filter(
                                web_root_file
                            )) {
                                console.debug(`Ignore ${web_root_file} from service worker (File filter)`);
                                continue;
                            }

                            if ((ignore_jsdoc_files ?? true) && [
                                ".cjs",
                                ".js",
                                ".mjs"
                            ].includes(extname(_file))) {
                                const code = await readFile(_file, "utf8");

                                if (code.includes("* @typedef {") && code.replaceAll(/\/\*[\s\S]*?\*\//g, "").trim() === "") {
                                    console.debug(`Ignore ${web_root_file} from service worker (JSDoc file)`);
                                    continue;
                                }
                            }

                            files.push(web_root_file);
                        }
                    }

                    return files;
                })(
                    web_root
                )
            ],
            APPLICATION_CACHE_PREFIX: application_cache_prefix,
            APPLICATION_CACHE_VERSION: crypto.randomUUID(),
            SKIP_WAITING
        })));
    }
}
