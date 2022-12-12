import { fileURLToPath } from "node:url";
import { SKIP_WAITING } from "../../../../../flux-pwa-api/src/Adapter/Pwa/SKIP_WAITING.mjs";
import { dirname, join, relative } from "node:path/posix";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));

export class GenerateServiceWorkerCommand {
    /**
     * @returns {GenerateServiceWorkerCommand}
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
     * @returns {Promise<void>}
     */
    async generateServiceWorker(web_root, service_worker_mjs_file, application_cache_prefix, service_worker_template_mjs_file = null, data = null) {
        await writeFile(service_worker_mjs_file, "", "utf8");

        await writeFile(service_worker_mjs_file, (await readFile(service_worker_template_mjs_file ?? join(__dirname, "..", "..", "..", "Adapter", "service-worker-template.mjs"), "utf8")).replaceAll("{ /*%DATA%*/ }", JSON.stringify({
            ...data ?? {},
            APPLICATION_CACHE_FILES: [
                "",
                ...await (async function scanFiles(folder) {
                    const files = [];

                    for (const file of await readdir(folder)) {
                        const _file = join(folder, file);

                        const _stat = await stat(_file);

                        if (_stat.isDirectory()) {
                            files.push(...await scanFiles(_file));
                        } else {
                            files.push(relative(web_root, _file));
                        }
                    }

                    return files;
                })(web_root)
            ],
            APPLICATION_CACHE_PREFIX: application_cache_prefix,
            APPLICATION_CACHE_VERSION: crypto.randomUUID(),
            SKIP_WAITING
        })), "utf8");
    }
}
