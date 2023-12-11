import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chmod, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path/posix";

const FUNCTION_NAME_CSS_TO_STYLE_SHEET = "cssToStyleSheet";

const FUNCTION_NAME_LOAD_MODULE = "load_module";

const MODULE_TYPE_CSS = "css";

const MODULE_TYPE_JAVASCRIPT = "javascript";

const MODULE_TYPE_JSON = "json";

export class Bundler {
    /**
     * @returns {Bundler}
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
     * @param {string} input_mjs_file
     * @param {string} output_mjs_file
     * @param {((css: string) => Promise<string>) | null} minify_css
     * @param {((css: string) => Promise<string>) | null} minify_xml
     * @param {string | null} dev_mode
     * @param {boolean | null} no_top_level_await
     * @returns {Promise<void>}
     */
    async bundle(input_mjs_file, output_mjs_file, minify_css = null, minify_xml = null, dev_mode = null, no_top_level_await = null) {
        const _dev_mode = dev_mode ?? false;

        console.log(`Bundle ${output_mjs_file}`);

        const mode = !existsSync(output_mjs_file) ? (await stat(input_mjs_file)).mode : null;

        const module_ids = {};

        const modules = _dev_mode ?? false ? {} : [];

        const [
            module_id,
            hash_bang
        ] = await this.#bundle(
            input_mjs_file,
            input_mjs_file,
            output_mjs_file,
            !_dev_mode ? minify_css : null,
            !_dev_mode ? minify_xml : null,
            module_ids,
            modules
        );

        const code = await readFile(join(dirname(fileURLToPath(import.meta.url)), "Template", "bundle.mjs"), "utf8");

        await writeFile(output_mjs_file, `${hash_bang !== null ? `${hash_bang}\n` : ""}${(no_top_level_await ?? false ? code.replace(/^await /, "") : code).replaceAll("/*%ROOT_MODULE_ID%*/", JSON.stringify(module_id)).replaceAll("{ /*%INIT_STATUS%*/ }", Array.isArray(modules) ? "[]" : "{}").replaceAll("{ /*%MODULES%*/ }", () => Array.isArray(modules) ? `[\n${modules.join(",\n")}\n    ]` : `{\n${Object.entries(modules).map(([
            _module_id,
            module
        ]) => `        ${JSON.stringify(_module_id)}: ${module}`).join(",\n")}\n    }`)}`);

        if (mode !== null) {
            await chmod(output_mjs_file, mode);
        }
    }

    /**
     * @param {string} path
     * @param {string} input_mjs_file
     * @param {string} output_mjs_file
     * @param {((css: string) => Promise<string>) | null} minify_css
     * @param {((css: string) => Promise<string>) | null} minify_xml
     * @param {{[key: string]: number | string}} module_ids
     * @param {string[] | {[key: string]: string}} modules
     * @param {string | null} module_type
     * @returns {Promise<[number | string, string | null]>}
     */
    async #bundle(path, input_mjs_file, output_mjs_file, minify_css, minify_xml, module_ids, modules, module_type = null) {
        const _module_type = module_type ?? MODULE_TYPE_JAVASCRIPT;

        const is_file_path = path.startsWith("/") || path.startsWith(".");
        const _path = is_file_path ? relative(dirname(output_mjs_file), path) : path;

        const module_id_key = `${_module_type}_${path}`;
        module_ids[module_id_key] ??= Array.isArray(modules) ? modules.length : _path;
        const module_id = module_ids[module_id_key];

        let hash_bang = null;

        if ((modules[module_id] ?? null) === null) {
            modules[module_id] = "";

            let has_load_modules = false;
            let code;

            if (is_file_path) {
                switch (_module_type) {
                    case MODULE_TYPE_CSS:
                        has_load_modules = true;

                        [
                            code
                        ] = await this.#readFile(
                            path
                        );

                        for (const [
                            _url,
                            file
                        ] of code.matchAll(/url\(["']?([^"']+)["']?\)/g)) {
                            if (!code.includes(_url) || file.startsWith("data:")) {
                                continue;
                            }

                            const _file = join(dirname(path), file);

                            const [
                                ext,
                                mime_type
                            ] = await this.#getMimeType(
                                file
                            );

                            let data;
                            if (ext === "svg") {
                                [
                                    data
                                ] = await this.#readFile(
                                    _file
                                );

                                if (minify_xml !== null) {
                                    data = await minify_xml(
                                        data
                                    );
                                }

                                data = btoa(data);
                            } else {
                                data = await readFile(_file, "base64");
                            }

                            code = code.replaceAll(_url, `url("data:${mime_type};base64,${data}")`);
                        }

                        if (minify_css !== null) {
                            code = await minify_css(
                                code
                            );
                        }

                        code = `const {\n    ${FUNCTION_NAME_CSS_TO_STYLE_SHEET}\n} = await ${FUNCTION_NAME_LOAD_MODULE}(\n    ${JSON.stringify((await this.#bundle(
                            FUNCTION_NAME_CSS_TO_STYLE_SHEET,
                            input_mjs_file,
                            output_mjs_file,
                            minify_css,
                            minify_xml,
                            module_ids,
                            modules
                        ))[0])}\n);\nreturn {\n    default: await ${FUNCTION_NAME_CSS_TO_STYLE_SHEET}(\n        ${this.#toTemplateString(
                            code
                        )}\n    )\n};`;
                        break;

                    case MODULE_TYPE_JSON:
                        code = `return {\n    default: ${(await this.#readFile(
                            path
                        ))[0]}\n};`;
                        break;

                    case MODULE_TYPE_JAVASCRIPT:
                        if (extname(path).substring(1).toLowerCase() === "mjs") {
                            [
                                code,
                                hash_bang
                            ] = await this.#readFile(
                                path
                            );

                            code = this.#removeJsDocImports(
                                code
                            );

                            code = this.#replaceNodeJsOrBrowserDiffImportsToNodeJsImports(
                                code
                            );

                            code = this.#replaceStaticImportsWithDynamicImports(
                                code
                            );

                            code = this.#replaceFluxImportsCssWithCssAssertDynamicImports(
                                code
                            );

                            code = this.#replaceExportsWithReturns(
                                code
                            );

                            [
                                has_load_modules,
                                code
                            ] = await this.#replaceDynamicImportsWithLoadModules(
                                path,
                                input_mjs_file,
                                output_mjs_file,
                                minify_css,
                                minify_xml,
                                module_ids,
                                modules,
                                has_load_modules,
                                code
                            );

                            code = this.#correctImportMetaUrls(
                                relative(dirname(input_mjs_file), path),
                                code
                            );
                        } else {
                            code = `return import(${JSON.stringify(_path)});`;
                        }
                        break;

                    default:
                        code = `return import(${JSON.stringify(_path)}, { assert: { type: ${JSON.stringify(_module_type)} } });`;
                        break;
                }
            } else {
                switch (path) {
                    case FUNCTION_NAME_CSS_TO_STYLE_SHEET:
                        code = this.#replaceExportsWithReturns(
                            (await this.#readFile(
                                join(dirname(fileURLToPath(import.meta.url)), "cssToStyleSheet.mjs")
                            ))[0]
                        );
                        break;

                    default:
                        code = `return import(${JSON.stringify(path)});`;
                        break;
                }
            }

            modules[module_id] = `${Array.isArray(modules) ? `        // ${module_id} - ${_path}\n        ` : ""}async ${has_load_modules ? FUNCTION_NAME_LOAD_MODULE : "()"} => {\n${code.trim()}\n        }`;
        }

        return [
            module_id,
            hash_bang
        ];
    }

    /**
     * @param {string} relative_path
     * @param {string} code
     * @returns {string}
     */
    #correctImportMetaUrls(relative_path, code) {
        return code.replaceAll(/(\$\{\s*import\s*\.\s*meta\s*\.\s*url\s*\.\s*substring\s*\(\s*0\s*,\s*import\s*\.\s*meta\s*\.\s*url\s*\.\s*lastIndexOf\s*\(\s*"\/"\s*\)\s*\)\s*\})\/*/g, (_, import_meta_url) => {
            const relatives = dirname(relative_path);

            return `${import_meta_url}/${relatives !== "." ? `${relatives}/` : ""}`;
        }).replaceAll(/(join\s*\()?dirname\s*\(fileURLToPath\s*\(\s*import\s*\.\s*meta\s*\.\s*url\s*\)\s*\)/g, (import_meta_url, _join = null) => {
            const relatives = dirname(relative_path);

            if (relatives === ".") {
                return import_meta_url;
            }

            return _join !== null ? `${import_meta_url}, ${JSON.stringify(relatives)}` : `\`\${${import_meta_url}}/${relatives}\``;
        });
    }

    /**
     * @param {string} path
     * @returns {Promise<[string, string]>}
     */
    async #getMimeType(path) {
        const ext = extname(path).substring(1).toLowerCase();

        return [
            ext,
            Object.entries((await import("mime-db")).default).find(([
                ,
                value
            ]) => value?.extensions?.includes(ext) ?? false)?.[0] ?? ""
        ];
    }

    /**
     * @param {string} path
     * @returns {Promise<[string, string | null]>}
     */
    async #readFile(path) {
        let code = (await readFile(path, "utf8")).replaceAll("\r\n", "\n").replaceAll("\r", "\n");

        let hash_bang = null;

        if (code.startsWith("#!")) {
            code = code.split("\n");
            hash_bang = code.shift();
            code = code.join("\n");
        }

        return [
            code.trim(),
            hash_bang
        ];
    }

    /**
     * @param {string} code
     * @returns {string}
     */
    #removeJsDocImports(code) {
        return code.replaceAll(/(\s*\/\*\*[\s*]*@typedef\s*\{import\s*\(\s*["'`][^"'`]*["'`]\s*\)\s*\.\w*\s*\}\s*\w*[\s*]*\*\/\s*)+/g, "\n\n");
    }

    /**
     * @param {string} path
     * @param {string} input_mjs_file
     * @param {string} output_mjs_file
     * @param {((css: string) => Promise<string>) | null} minify_css
     * @param {((css: string) => Promise<string>) | null} minify_xml
     * @param {{[key: string]: number}} module_ids
     * @param {string[]} modules
     * @param {boolean} has_load_modules
     * @param {string} code
     * @returns {Promise<[boolean, string]>}
     */
    async #replaceDynamicImportsWithLoadModules(path, input_mjs_file, output_mjs_file, minify_css, minify_xml, module_ids, modules, has_load_modules, code) {
        let _has_load_modules = has_load_modules;
        let _code = code;

        for (const [
            _import,
            file,
            assert_type = null
        ] of [
                ..._code.matchAll(/import\s*\(["'`]([^"'`]+)["'`]\)/g),
                ..._code.matchAll(/import\s*\(["'`]([^"'`]+)["'`]\s*,\s*\{\s*assert\s*:\s*\{\s*type\s*:\s*["'`]([^"'`]+)["'`]\s*\}\s*\}\s*\)/g)
            ]) {
            if (!_code.includes(_import)) {
                continue;
            }

            _has_load_modules = true;

            _code = _code.replaceAll(_import, `${FUNCTION_NAME_LOAD_MODULE}(\n    ${JSON.stringify((await this.#bundle(
                file.startsWith(".") ? join(dirname(path), file) : file,
                input_mjs_file,
                output_mjs_file,
                minify_css,
                minify_xml,
                module_ids,
                modules,
                assert_type
            ))[0])}\n)`);
        }

        return [
            _has_load_modules,
            _code
        ];
    }

    /**
     * @param {string} code
     * @returns {string}
     */
    #replaceExportsWithReturns(code) {
        const exports = [];

        return `${code.replaceAll(/export\s+((async\s+)?(class|const|function|function\*|let|var)\s*(\w+))/g, (_, _export, __, ___, key) => {
            exports.push(key);

            return _export;
        }).replaceAll(/export\s*\{\s*([\w\s,]*)\s*\}(\s*;+)?/g, (_, keys) => {
            for (const key of keys.split(",").map(_key => _key.trim().replaceAll(" as ", ": ")).filter(_key => _key !== "")) {
                exports.push(key);
            }

            return "";
        })}${exports.length > 0 ? `\nreturn {\n${exports.map(key => `    ${key}`).join(",\n")}\n};` : ""}`;
    }

    /**
     * @param {string} code
     * @returns {string}
     * @deprecated
     */
    #replaceFluxImportsCssWithCssAssertDynamicImports(code) {
        return code.replaceAll(/await\s+flux_import_css\s*\.\s*import\s*\(\s*`\$\{\s*import\s*\.\s*meta\s*\.\s*url\s*\.\s*substring\s*\(\s*0\s*,\s*import\s*\.\s*meta\s*\.\s*url\s*\.\s*lastIndexOf\s*\(\s*"\/"\s*\)\s*\)\s*\}/g, "await flux_import_css.import(\n    `.").replaceAll(/(let|var)\s*flux_import_css\s*=\s*null\s*;*([\w\s=;]+)?\s*try\s*\{\s*\(\s*\{\s*flux_import_css\s*\}\s*=\s*await\s+import\s*\(\s*["'`][^"'`]*["'`]\s*\)\s*\)\s*;*\s*\}\s*catch\s*\(\s*\w+\s*\)\s*\{\s*[^\n}]*\s*\}\s*if\s*\(\s*flux_import_css\s*!==\s*null\s*\)\s*\{\s*([^}]*)\s*\}/g, (_, __, variables, _import) => `${variables ?? ""}${_import.trim()}`).replaceAll(/await\s+flux_import_css\s*\.\s*import\s*\(\s*(["'`][^"'`]*["'`])\s*\)/g, (_, path) => `(await import(${path}, { assert: { type: "css" } })).default`).replaceAll(/\s*(const|let|var)\s*\{\s*flux_import_css\s*\}\s*=\s*await\s+import\s*\(\s*["'`][^"'`]+["'`]\s*\)\s*;*\s*/g, "");
    }

    /**
     * @param {string} code
     * @returns {string}
     */
    #replaceNodeJsOrBrowserDiffImportsToNodeJsImports(code) {
        return code.replaceAll(/(import\s*\(\s*["'`][./]*)\$\{\s*typeof\s+process\s*!==\s*["'`]undefined["'`]\s*\?\s*["'`]([^"'`]*)["'`]\s*:\s*["'`][^"'`]*["'`]\s*\}/g, (_, start, path) => `${start}${path}`);
    }

    /**
     * @param {string} code
     * @returns {string}
     */
    #replaceStaticImportsWithDynamicImports(code) {
        return code.replaceAll(/(import\s*)(\w+)(\s*from)/g, (_, _import, property, from) => `${_import}{\n    default: ${property}\n}${from}`).replaceAll(/import\s*(\{[^}]*\})\s*from\s*(["'`][^"'`]*["'`])\s*assert\s*(\{[^}]*\})/g, (_, properties, path, assert) => `const ${properties.replaceAll(" as ", ": ")} = await import(${path}, { assert: ${assert} })`).replaceAll(/import\s*(\{[^}]*\})\s*from\s*(["'`][^"'`]*["'`])/g, (_, properties, path) => `const ${properties.replaceAll(" as ", ": ")} = await import(${path})`).replaceAll(/(\s|^)import\s*(["'`][^"'`]*["'`])/g, (_, start, path) => `${start}await import(${path})`);
    }

    /**
     * @param {string} code
     * @returns {string}
     */
    #toTemplateString(code) {
        return `\`${code.replaceAll("\\", "\\\\").replaceAll("$", "\\$").replaceAll("`", "\\`")}\``;
    }
}
