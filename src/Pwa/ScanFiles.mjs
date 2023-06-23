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
     * @param {string} root
     * @param {fileFilter | null} file_filter
     * @param {boolean | null} exclude_jsdoc_files
     * @returns {Promise<string[][]>}
     */
    async scanFiles(root, file_filter = null, exclude_jsdoc_files = null) {
        return (async function scanFiles(folder) {
            const files = [
                [],
                [],
                []
            ];

            for (const file of await readdir(folder)) {
                const _file = join(folder, file);

                if ((await stat(_file)).isDirectory()) {
                    for (const [
                        i,
                        _files
                    ] of (await scanFiles(
                        _file
                    )).entries()) {
                        files[i].push(..._files);
                    }
                } else {
                    const root_file = relative(root, _file);

                    if (file_filter !== null && !file_filter(
                        root_file
                    )) {
                        files[1].push(root_file);
                        continue;
                    }

                    if ((exclude_jsdoc_files ?? true) && [
                        ".cjs",
                        ".js",
                        ".mjs"
                    ].includes(extname(_file))) {
                        const code = await readFile(_file, "utf8");

                        if (code.includes("* @typedef {") && code.replaceAll(/\/\*[\s\S]*?\*\//g, "").trim() === "") {
                            files[2].push(root_file);
                            continue;
                        }
                    }

                    files[0].push(root_file);
                }
            }

            return files;
        })(
            root
        );
    }
}
