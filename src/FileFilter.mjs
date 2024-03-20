import { extname, join, relative } from "node:path";
import { lstat, readdir, readFile } from "node:fs/promises";

export class FileFilter {
    /**
     * @returns {Promise<FileFilter>}
     */
    static async new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {

    }

    /**
     * @param {string} root
     * @param {((root_file: string) => boolean) | null} file_filter
     * @param {boolean | null} exclude_jsdoc_files
     * @returns {Promise<string[][]>}
     */
    async fileFilter(root, file_filter = null, exclude_jsdoc_files = null) {
        return (async function scanFiles(folder) {
            const files = [];
            const excluded_file_filter_files = [];
            const excluded_jsdoc_file = [];

            for (const name of await readdir(folder)) {
                const file = join(folder, name);

                if ((await lstat(file)).isDirectory()) {
                    const [
                        folder_files,
                        folder_excluded_file_filter_files,
                        folder_excluded_jsdoc_file
                    ] = await scanFiles(
                        file
                    );
                    files.push(...folder_files);
                    excluded_file_filter_files.push(...folder_excluded_file_filter_files);
                    excluded_jsdoc_file.push(...folder_excluded_jsdoc_file);
                } else {
                    const root_file = relative(root, file);

                    if (file_filter !== null && !file_filter(
                        root_file
                    )) {
                        excluded_file_filter_files.push(root_file);
                        continue;
                    }

                    if ((exclude_jsdoc_files ?? true) && [
                        "cjs",
                        "js",
                        "mjs"
                    ].includes(extname(file).substring(1).toLowerCase())) {
                        const code = await readFile(file, "utf8");

                        if (code.includes("* @typedef {") && code.replaceAll(/\/\*[\s\S]*?\*\//g, "").trim() === "") {
                            excluded_jsdoc_file.push(root_file);
                            continue;
                        }
                    }

                    files.push(root_file);
                }
            }

            return [
                files,
                excluded_file_filter_files,
                excluded_jsdoc_file
            ];
        })(
            root
        );
    }
}
