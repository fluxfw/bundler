import { extname, join } from "node:path/posix";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";

let CleanCss = null;
try {
    CleanCss = (await import("clean-css")).default;
} catch (error) {
    console.info("clean-css is not available (", error, ")");
}

let minifyXml = null;
try {
    minifyXml = (await import("minify-xml")).minify;
} catch (error) {
    console.info("minify-xml is not available (", error, ")");
}

let uglifyJs = null;
try {
    uglifyJs = (await import("uglify-js")).minify;
} catch (error) {
    console.info("uglify-js is not available (", error, ")");
}

export class Minifier {
    /**
     * @returns {Minifier}
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
     * @param {string} code
     * @returns {Promise<string>}
     */
    async minifyCommonJsJavaScript(code) {
        return this.#minifyJavaScript(
            code,
            false
        );
    }

    /**
     * @param {string} code
     * @returns {Promise<string>}
     */
    async minifyCSS(code) {
        const result = new CleanCss().minify(this.#minify(
            code
        ));

        if (result.errors.length > 0) {
            throw result.errors;
        }

        return result.styles;
    }

    /**
     * @param {string} code
     * @returns {Promise<string>}
     */
    async minifyESMJavaScript(code) {
        return this.#minifyJavaScript(
            code
        );
    }

    /**
     * @param {string} folder
     * @returns {Promise<void>}
     */
    async minifyFolder(folder) {
        const files = await (async function scanFiles(_folder) {
            const _files = [];

            for (const name of await readdir(_folder)) {
                const file = join(_folder, name);

                if ((await stat(file)).isDirectory()) {
                    _files.push(...await scanFiles(
                        file
                    ));
                } else {
                    _files.push(file);
                }
            }

            return _files;
        })(
            folder
        );

        for (const file of files) {
            switch (extname(file).substring(1).toLowerCase()) {
                case "cjs":
                case "js":
                    console.log(`Minify ${file}`);

                    await this.#writeFile(
                        file,
                        await this.minifyCommonJsJavaScript(
                            await this.#readFile(
                                file
                            )
                        )
                    );
                    break;

                case "css":
                    console.log(`Minify ${file}`);

                    await this.#writeFile(
                        file,
                        await this.minifyCSS(
                            await this.#readFile(
                                file
                            )
                        )
                    );
                    break;

                case "htm":
                case "html":
                    console.log(`Minify ${file}`);

                    await this.#writeFile(
                        file,
                        await this.minifyHTML(
                            await this.#readFile(
                                file
                            )
                        )
                    );
                    break;

                case "json":
                    console.log(`Minify ${file}`);

                    await this.#writeFile(
                        file,
                        await this.minifyJSON(
                            await this.#readFile(
                                file
                            )
                        )
                    );
                    break;

                case "mjs":
                    console.log(`Minify ${file}`);

                    await this.#writeFile(
                        file,
                        await this.minifyESMJavaScript(
                            await this.#readFile(
                                file
                            )
                        )
                    );
                    break;

                case "sh":
                    console.log(`Minify ${file}`);

                    await this.#writeFile(
                        file,
                        await this.minifyShell(
                            await this.#readFile(
                                file
                            )
                        )
                    );
                    break;

                case "svg":
                case "xml":
                    console.log(`Minify ${file}`);

                    await this.#writeFile(
                        file,
                        await this.minifyXML(
                            await this.#readFile(
                                file
                            )
                        )
                    );
                    break;

                default:
                    break;
            }
        }
    }

    /**
     * @param {string} code
     * @returns {Promise<string>}
     */
    async minifyHTML(code) {
        return this.#minifyXML(
            code,
            true
        );
    }

    /**
     * @param {string} code
     * @returns {Promise<string>}
     */
    async minifyJSON(code) {
        return JSON.stringify(JSON.parse(this.#minify(
            code
        )));
    }

    /**
     * @param {string} code
     * @returns {Promise<string>}
     */
    async minifyShell(code) {
        let _code = this.#minify(
            code
        );

        while (_code.includes("\n\n")) {
            _code = _code.replaceAll("\n\n", "\n");
        }

        return _code;
    }

    /**
     * @param {string} code
     * @returns {Promise<string>}
     */
    async minifyXML(code) {
        return this.#minifyXML(
            code
        );
    }

    /**
     * @param {string} code
     * @returns {string}
     */
    #minify(code) {
        let _code = code.replaceAll("\r\n", "\n").replaceAll("\r", "\n");

        if (_code.startsWith("#!")) {
            _code = _code.split("\n");
            _code = `${_code.shift()}\n${_code.join("\n").trim()}`;
        } else {
            _code = _code.trim();
        }

        return _code;
    }

    /**
     * @param {string} code
     * @param {boolean | null} module
     * @returns {Promise<string>}
     */
    async #minifyJavaScript(code, module = null) {
        const result = uglifyJs(this.#minify(
            code
        ), {
            module: module ?? true
        });

        if ((result.error ?? null) !== null) {
            throw result.error;
        }

        return result.code;
    }

    /**
     * @param {string} code
     * @param {boolean | null} html
     * @returns {Promise<string>}
     */
    async #minifyXML(code, html = null) {
        return minifyXml(this.#minify(
            code
        ), {
            ...html ?? false ? {
                collapseEmptyElements: false
            } : null
        });
    }

    /**
     * @param {string} path
     * @returns {Promise<string>}
     */
    async #readFile(path) {
        return readFile(path, "utf8");
    }

    /**
     * @param {string} path
     * @param {string} code
     * @returns {Promise<void>}
     */
    async #writeFile(path, code) {
        await writeFile(path, code);
    }
}
