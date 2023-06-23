import { extname, join, relative } from "node:path/posix";
import { readdir, readFile, stat } from "node:fs/promises";

/** @typedef {import("./fileFilter.mjs").fileFilter} fileFilter */

export class ScanFiles {
    /**
     * @returns {ScanFiles}
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
     * @param {fileFilter | null} filter_filter
     * @param {boolean | null} ignore_jsdoc_files
     * @returns {Promise<string[][]>}
     */
    async scanFiles(web_root, filter_filter = null, ignore_jsdoc_files = null) {
        return (async function scanFiles(folder) {
            const files = [
                [],
                [],
                []
            ];

            for (const file of await readdir(folder)) {
                const _file = join(folder, file);

                const _stat = await stat(_file);

                if (_stat.isDirectory()) {
                    for (const [
                        i,
                        _files
                    ] of (await scanFiles(
                        _file
                    )).entries()) {
                        files[i].push(..._files);
                    }
                } else {
                    const web_root_file = relative(web_root, _file);

                    if (filter_filter !== null && !filter_filter(
                        web_root_file
                    )) {
                        files[1].push(web_root_file);
                        continue;
                    }

                    if ((ignore_jsdoc_files ?? true) && [
                        ".cjs",
                        ".js",
                        ".mjs"
                    ].includes(extname(_file))) {
                        const code = await readFile(_file, "utf8");

                        if (code.includes("* @typedef {") && code.replaceAll(/\/\*[\s\S]*?\*\//g, "").trim() === "") {
                            files[2].push(web_root_file);
                            continue;
                        }

                        files[0].push(web_root_file);
                    }
                }
            }

            return files;
        })(
            web_root
        );
    }
}
