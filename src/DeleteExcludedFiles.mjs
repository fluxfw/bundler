import { FileFilter } from "./FileFilter.mjs";
import { join } from "node:path";
import { lstat, unlink } from "node:fs/promises";

export class DeleteExcludedFiles {
    /**
     * @type {FileFilter}
     */
    #file_filter;

    /**
     * @returns {Promise<DeleteExcludedFiles>}
     */
    static async new() {
        return new this(
            await FileFilter.new()
        );
    }

    /**
     * @param {FileFilter} file_filter
     * @private
     */
    constructor(file_filter) {
        this.#file_filter = file_filter;
    }

    /**
     * @param {string} root
     * @param {((root_file: string) => boolean) | null} file_filter
     * @param {boolean | null} exclude_jsdoc_files
     * @returns {Promise<void>}
     */
    async deleteExcludedFiles(root, file_filter = null, exclude_jsdoc_files = null) {
        const [
            ,
            excluded_file_filter_files,
            excluded_jsdoc_files
        ] = await this.#file_filter.fileFilter(
            root,
            file_filter,
            exclude_jsdoc_files
        );

        if (excluded_file_filter_files.length > 0) {
            for (const root_file of excluded_file_filter_files) {
                const file = join(root, root_file);

                try {
                    await lstat(file);
                } catch (error) {
                    if ((error?.code ?? null) === "ENOENT") {
                        continue;
                    }

                    throw error;
                }

                console.log(`Delete ${file} (File filter)`);

                await unlink(file);
            }
        }

        if (excluded_jsdoc_files.length > 0) {
            for (const root_file of excluded_jsdoc_files) {
                const file = join(root, root_file);

                try {
                    await lstat(file);
                } catch (error) {
                    if ((error?.code ?? null) === "ENOENT") {
                        continue;
                    }

                    throw error;
                }

                console.log(`Delete ${file} (JSDoc file)`);

                await unlink(file);
            }
        }
    }
}
