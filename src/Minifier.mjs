export class Minifier {
    /**
     * @returns {Promise<Minifier>}
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
        return (await new (await import("clean-css")).default({
            level: 2,
            returnPromise: true
        }).minify(code)).styles;
    }

    /**
     * @param {string} code
     * @returns {Promise<string>}
     */
    async minifyCSSRule(code) {
        const {
            default: CleanCSS
        } = await import("clean-css");

        for (const level of [
            2,
            1,
            0
        ]) {
            const result = await new CleanCSS({
                level,
                returnPromise: true
            }).minify(code);

            if (result.styles !== "") {
                return result.styles;
            }
        }

        return code.replaceAll(/\s/g, "");
    }

    /**
     * @param {string} code
     * @returns {Promise<string>}
     */
    async minifyCSSSelector(code) {
        return this.#minify(
            code
        ).replaceAll(/\s*([,:])\s*/g, (_, char) => char);
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
    async minifyPython(code) {
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
        const result = (await import("uglify-js")).minify(this.#minify(
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
        return (await import("minify-xml")).minify(this.#minify(
            code
        ), {
            ...html ?? false ? {
                collapseEmptyElements: false
            } : null
        });
    }
}
