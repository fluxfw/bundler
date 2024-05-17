import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chmod, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createRequire, isBuiltin } from "node:module";
import { dirname, extname, join } from "node:path";

export class Bundler {
    /**
     * @returns {Promise<Bundler>}
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
     * @param {string} input_path
     * @param {string} output_file
     * @param {((path: string, parent_path?: string | null) => Promise<string | false | null>) | null} resolve
     * @param {((css: string) => Promise<string>) | null} minify_css
     * @param {((css: string) => Promise<string>) | null} minify_xml
     * @param {boolean | null} dev
     * @returns {Promise<void>}
     */
    async bundle(input_path, output_file, resolve = null, minify_css = null, minify_xml = null, dev = null) {
        console.log(`Bundle ${output_file}`);

        const _dev = dev ?? false;

        const es_modules = _dev ? {} : [];
        const commonjs_modules = structuredClone(es_modules);

        const result = await this.#bundle(
            null,
            input_path,
            resolve,
            !_dev ? minify_css : null,
            !_dev ? minify_xml : null,
            {},
            {},
            {},
            es_modules,
            commonjs_modules
        );

        if (result === null) {
            throw Error(`Invalid input path ${input_path}!`);
        }

        const [
            module_id,
            hash_bang,
            exports,
            absolute_path,
            is_commonjs
        ] = result;

        let mode = null;
        if (!existsSync(output_file)) {
            ({
                mode
            } = await stat(absolute_path));

            await mkdir(dirname(output_file), {
                recursive: true
            });
        }

        const template = await readFile(join(dirname(fileURLToPath(import.meta.url)), "bundle-template.mjs"), "utf8");

        await writeFile(output_file, `${hash_bang !== null ? `${hash_bang}\n` : ""}${[
            [
                "ES",
                es_modules
            ],
            [
                "COMMONJS",
                commonjs_modules
            ]
        ].reduce((code, [
            placeholder_prefix,
            modules
        ]) => code.replaceAll(`"%${placeholder_prefix}_MODULES%"`, () => Array.isArray(modules) ? `[${modules.join(", ")}]` : `{${Object.entries(modules).map(([
            _module_id,
            module
        ]) => `${JSON.stringify(_module_id)}: ${module}`).join(", ")}}`), exports.length > 0 ? exports.length === 1 && exports[0] === "default" ? `export default (${template.replace(/;\n$/, "")}).default;\n` : exports.includes("default") ? `const exports = ${template}\nexport default exports.default;\nexport const {${exports.filter(key => key !== "default").join(", ")}} = exports;\n` : `export const {${exports.join(", ")}} = ${template}` : template).replaceAll("\"%INIT_LOADED_MODULES%\"", Array.isArray(es_modules) ? "[]" : "{}").replaceAll("\"%ROOT_MODULE_ID%\"", JSON.stringify(module_id)).replaceAll("\"%ROOT_MODULE_IS_COMMONJS%\"", is_commonjs)}`);

        if (mode !== null) {
            await chmod(output_file, mode);
        }
    }

    /**
     * @param {string | null} parent_path
     * @param {string} path
     * @param {((path: string, parent_path?: string | null) => Promise<string | false | null>) | null} resolve
     * @param {((css: string) => Promise<string>) | null} minify_css
     * @param {((css: string) => Promise<string>) | null} minify_xml
     * @param {{[key: string]: boolean}} modules_are_commonjs
     * @param {{[key: string]: number | string}} es_module_ids
     * @param {{[key: string]: number | string}} commonjs_module_ids
     * @param {string[] | {[key: string]: string}} es_modules
     * @param {string[] | {[key: string]: string}} commonjs_modules
     * @param {string | null} with_type
     * @returns {Promise<[number | string, string | null, string[], string, boolean] | null>}
     */
    async #bundle(parent_path, path, resolve, minify_css, minify_xml, modules_are_commonjs, es_module_ids, commonjs_module_ids, es_modules, commonjs_modules, with_type = null) {
        const absolute_path = (resolve !== null ? await resolve(
            path,
            parent_path
        ) : null) ?? (!isBuiltin(path) ? createRequire(parent_path ?? join(process.cwd(), ".mjs")).resolve(path) : false);

        if (absolute_path === false) {
            return null;
        }

        let read_file;
        modules_are_commonjs[absolute_path] ??= await (async () => {
            if (with_type === "cjs") {
                return true;
            }

            read_file = await this.#readFile(
                absolute_path
            );

            const [
                ,
                ,
                ,
                _is_commonjs
            ] = read_file;

            return _is_commonjs;
        })();
        const is_commonjs = modules_are_commonjs[absolute_path];

        const module_ids = is_commonjs ? commonjs_module_ids : es_module_ids;
        const modules = is_commonjs ? commonjs_modules : es_modules;

        module_ids[absolute_path] ??= Array.isArray(modules) ? modules.length : absolute_path;
        const module_id = module_ids[absolute_path];

        let hash_bang = null;
        let exports = [];

        if ((modules[module_id] ?? null) === null) {
            modules[module_id] = "";

            let code;

            switch (with_type) {
                case "css":
                    [
                        code
                    ] = read_file ?? await this.#readFile(
                        absolute_path
                    );

                    for (const [
                        _url,
                        _path
                    ] of code.matchAll(/url\(["']?([^"']+)["']?\)/g)) {
                        if (!code.includes(_url) || _path.startsWith("data:")) {
                            continue;
                        }

                        const _absolute_path = createRequire(absolute_path).resolve(_path);

                        const [
                            ext,
                            mime_type
                        ] = await this.#getMimeType(
                            _absolute_path
                        );

                        let data;
                        if (ext === "svg" && minify_xml !== null) {
                            [
                                data
                            ] = await this.#readFile(
                                _absolute_path
                            );

                            data = await minify_xml(
                                data
                            );

                            data = btoa(data);
                        } else {
                            data = await readFile(_absolute_path, "base64");
                        }

                        code = code.replaceAll(_url, `url("data:${mime_type};base64,${data}")`);
                    }

                    if (minify_css !== null) {
                        code = await minify_css(
                            code
                        );
                    }

                    [
                        code,
                        exports
                    ] = this.#replaceExportsWithExportKeys(
                        `const style_sheet = new CSSStyleSheet();\nstyle_sheet.replaceSync(${JSON.stringify(code)});\nexport default style_sheet;`
                    );
                    break;

                case "json":
                    [
                        code
                    ] = read_file ?? await this.#readFile(
                        absolute_path
                    );

                    [
                        code,
                        exports
                    ] = this.#replaceExportsWithExportKeys(
                        `export default ${code};`
                    );
                    break;

                default: {
                    read_file ??= await this.#readFile(
                        absolute_path
                    );
                    [
                        code,
                        ,
                        hash_bang
                    ] = read_file;
                    const [
                        ,
                        ext
                    ] = read_file;

                    if (is_commonjs && ext === "json") {
                        code = `module.exports = ${code};`;
                    } else {
                        code = this.#replaceMisleadingKeywordsInComments(
                            code
                        );

                        if (is_commonjs) {
                            code = await this.#replaceRequiresWithLoadModules(
                                absolute_path,
                                resolve,
                                minify_css,
                                minify_xml,
                                modules_are_commonjs,
                                es_module_ids,
                                commonjs_module_ids,
                                es_modules,
                                commonjs_modules,
                                code
                            );

                            exports = [
                                "default"
                            ];
                        } else {
                            code = this.#replaceStaticImportsWithDynamicImports(
                                code
                            );

                            [
                                code,
                                exports
                            ] = this.#replaceExportsWithExportKeys(
                                code
                            );
                        }

                        code = await this.#replaceDynamicImportsWithLoadModules(
                            absolute_path,
                            resolve,
                            minify_css,
                            minify_xml,
                            modules_are_commonjs,
                            es_module_ids,
                            commonjs_module_ids,
                            es_modules,
                            commonjs_modules,
                            code
                        );
                    }
                }
                    break;
            }

            code = code.trim();

            modules[module_id] = `${Array.isArray(modules) ? `// ${module_id}\n` : ""}${!is_commonjs ? "async " : ""}(load_es_module, load_commonjs_module_for_es, ${is_commonjs ? "load_commonjs_module, module, exports, require, __filename, __dirname" : "export_es_object, export_es_key"}) => {\n${code}\n}`;
        }

        return [
            module_id,
            hash_bang,
            exports,
            absolute_path,
            is_commonjs
        ];
    }

    /**
     * @param {string} path
     * @returns {Promise<[string, string]>}
     */
    async #getMimeType(path) {
        const ext = extname(path).substring(1).toLowerCase();

        return [
            ext,
            Object.entries((await import("mime-db/db.json", { with: { type: "json" } })).default).find(([
                ,
                value
            ]) => value?.extensions?.includes(ext) ?? false)?.[0] ?? ""
        ];
    }

    /**
     * @param {string} path
     * @returns {Promise<[string, string, string | null, boolean]>}
     */
    async #readFile(path) {
        let code = (await readFile(path, "utf8")).replaceAll("\r\n", "\n").replaceAll("\r", "\n");

        const ext = extname(path).substring(1).toLowerCase();

        let hash_bang = null;
        if (code.startsWith("#!")) {
            code = code.split("\n");
            hash_bang = code.shift();
            code = code.join("\n");
        }

        return [
            code.trim(),
            ext,
            hash_bang,
            ext === "cjs" ? true : ext === "js" ? !(/(^|\n)\s*import\s*[^(]/.test(code) || /(^|\n)\s*export\s/.test(code) || /import\s*\.\s*meta/.test(code)) : false
        ];
    }

    /**
     * @param {string} parent_path
     * @param {((path: string, parent_path?: string | null) => Promise<string | false | null>) | null} resolve
     * @param {((css: string) => Promise<string>) | null} minify_css
     * @param {((css: string) => Promise<string>) | null} minify_xml
     * @param {{[key: string]: boolean}} modules_are_commonjs
     * @param {{[key: string]: number | string}} es_module_ids
     * @param {{[key: string]: number | string}} commonjs_module_ids
     * @param {string[] | {[key: string]: string}} es_modules
     * @param {string[] | {[key: string]: string}} commonjs_modules
     * @param {string} code
     * @returns {Promise<string>}
     */
    async #replaceDynamicImportsWithLoadModules(parent_path, resolve, minify_css, minify_xml, modules_are_commonjs, es_module_ids, commonjs_module_ids, es_modules, commonjs_modules, code) {
        let _code = code;

        for (const [
            _import,
            start,
            path,
            with_type = null
        ] of [
                ..._code.matchAll(/(^|[\s(,=])import\s*\(\s*["'`]([^"'`\n]+)["'`]\s*\)/g),
                ..._code.matchAll(/(^|[\s(,=])import\s*\(\s*["'`]([^"'`\n]+)["'`]\s*,\s*\{\s*with\s*:\s*\{\s*type\s*:\s*["'`]([^"'`\n]+)["'`]\s*\}\s*\}\s*\)/g)
            ]) {
            if (!_code.includes(_import)) {
                continue;
            }

            const result = await this.#bundle(
                parent_path,
                path,
                resolve,
                minify_css,
                minify_xml,
                modules_are_commonjs,
                es_module_ids,
                commonjs_module_ids,
                es_modules,
                commonjs_modules,
                with_type
            );

            if (result === null) {
                continue;
            }

            const [
                module_id,
                ,
                ,
                ,
                is_commonjs
            ] = result;

            _code = _code.replaceAll(_import, `${start}${is_commonjs ? "load_commonjs_module_for_es" : "load_es_module"}(${JSON.stringify(module_id)})`);
        }

        return _code;
    }

    /**
     * @param {string} code
     * @returns {[string, string[]]}
     */
    #replaceExportsWithExportKeys(code) {
        const exports = [];

        let count = 0;

        return [
            code.replaceAll(/export\s+((async\s+)?(class|const|function|function\s*\*|let|var)\s*(\w+))/g, (_, _export, __, ___, key) => {
                exports.push(key);

                return `export_es_key(${JSON.stringify(key)}, () => ${key});\n${_export}`;
            }).replaceAll(/export\s+((const|let|var)\s*[{[]([^}\]]*)[}\]])/g, (_, _export, __, keys) => {
                const _exports = [];

                for (const [
                    key,
                    as = null
                ] of keys.split(",").map(_key => _key.split(":").map(__key => __key.trim())).filter(([
                    _key
                ]) => _key !== "")) {
                    const _key = as ?? key;

                    exports.push(_key);

                    _exports.push(`export_es_key(${JSON.stringify(_key)}, () => ${_key});`);
                }

                if (_exports.length === 0) {
                    return _export;
                }

                return `${_exports.join("\n")}\n${_export}`;
            }).replaceAll(/export\s+(default)\s/g, (_, key) => {
                const _key = `${key}_${count++}`;

                exports.push(key);

                return `export_es_key(${JSON.stringify(key)}, () => ${_key});\nconst ${_key} = `;
            }).replaceAll(/export\s*\{([^}]*)\}\s*from\s*(["'`][^"'`\n]+["'`])(\s*with\s*(\{[^}]*\}))?(\s*;+)?/g, (_, keys, path, __, _with = null) => {
                const _exports = [];

                for (const [
                    key,
                    as = null
                ] of keys.split(",").map(_key => _key.split(" as ").map(__key => __key.trim())).filter(([
                    _key
                ]) => _key !== "")) {
                    const _key = as ?? key;

                    exports.push(_key);

                    _exports.push([
                        key,
                        _key
                    ]);
                }

                const _import = `await import(${path}${_with !== null ? `, {with: ${_with}}` : ""})`;

                if (_exports.length === 0) {
                    return `${_import};`;
                }

                if (_exports.length === 1) {
                    return `export_es_object({${_exports[0][1]}: (${_import}).${_exports[0][0]}});`;
                }

                return `export_es_object(await (async () => {const imports = ${_import};return {${_exports.map(([
                    key,
                    _key
                ]) => `${_key}: imports.${key}`).join(", ")}};})());`;
            }).replaceAll(/export\s*\{([^}]*)\}(\s*;+)?/g, (_, keys) => {
                const _exports = [];

                for (const [
                    key,
                    as = null
                ] of keys.split(",").map(_key => _key.split(" as ").map(__key => __key.trim())).filter(([
                    _key
                ]) => _key !== "")) {
                    const _key = as ?? key;

                    exports.push(_key);

                    _exports.push(_key !== key ? `${_key}: ${key}` : _key);
                }

                if (_exports.length === 0) {
                    return "";
                }

                return `export_es_object({${_exports.join(", ")}});`;
            }).replaceAll(/export\s+\*(\s+as\s+(\w+))?\s+from\s*(["'`][^"'`\n]+["'`])(\s*with\s*(\{[^}]*\}))?(\s*;+)?/g, (_, __, key = null, path, ___, _with = null) => {
                const _import = `await import(${path}${_with !== null ? `, {with: ${_with}}` : ""})`;

                if (key !== null) {
                    exports.push(key);

                    return `export_es_object({${key}: ${_import}});`;
                } else {
                    return `export_es_object(${_import});`;
                }
            }),
            Array.from(new Set(exports))
        ];
    }

    /**
     * @param {string} code
     * @returns {string}
     */
    #replaceMisleadingKeywordsInComments(code) {
        return code.replaceAll(/(\/\*[\s\S]*?\*\/|\/\/[^\n]*(\n|$))/g, comment => comment.replaceAll(/export|import|require/g, keyword => `__${keyword}__`));
    }

    /**
     * @param {string} parent_path
     * @param {((path: string, parent_path?: string | null) => Promise<string | false | null>) | null} resolve
     * @param {((css: string) => Promise<string>) | null} minify_css
     * @param {((css: string) => Promise<string>) | null} minify_xml
     * @param {{[key: string]: boolean}} modules_are_commonjs
     * @param {{[key: string]: number | string}} es_module_ids
     * @param {{[key: string]: number | string}} commonjs_module_ids
     * @param {string[] | {[key: string]: string}} es_modules
     * @param {string[] | {[key: string]: string}} commonjs_modules
     * @param {string} code
     * @returns {Promise<string>}
     */
    async #replaceRequiresWithLoadModules(parent_path, resolve, minify_css, minify_xml, modules_are_commonjs, es_module_ids, commonjs_module_ids, es_modules, commonjs_modules, code) {
        let _code = code;

        for (const [
            _require,
            start,
            path
        ] of _code.matchAll(/(^|[\s(,=])require\s*\(\s*["'`]([^"'`\n]+)["'`]\s*\)/g)) {
            if (!_code.includes(_require)) {
                continue;
            }

            const result = await this.#bundle(
                parent_path,
                path,
                resolve,
                minify_css,
                minify_xml,
                modules_are_commonjs,
                es_module_ids,
                commonjs_module_ids,
                es_modules,
                commonjs_modules,
                "cjs"
            );

            if (result === null) {
                continue;
            }

            const [
                module_id
            ] = result;

            _code = _code.replaceAll(_require, `${start}load_commonjs_module(${JSON.stringify(module_id)})`);
        }

        return _code;
    }

    /**
     * @param {string} code
     * @returns {string}
     */
    #replaceStaticImportsWithDynamicImports(code) {
        return code.replaceAll(/(import\s*)(\w+)(\s*,\s*\{([^}]*)\})?(\s*from)/g, (_, _import, default_property, __, properties = null, from) => `${_import}{default: ${default_property}${(properties?.trim() ?? "") !== "" ? `, ${properties}` : ""}}${from}`).replaceAll(/import\s*\{([^}]*)\}\s*from\s*(["'`][^"'`\n]+["'`])(\s*with\s*(\{[^}]*\}))?/g, (_, properties, path, __, _with = null) => `${properties.trim() !== "" ? `const {${properties.replaceAll(" as ", ": ")}} = ` : ""}await import(${path}${_with !== null ? `, {with: ${_with}}` : ""})`).replaceAll(/import\s*((\w+)\s*,\s*)?\*\s+as\s+(\w+)\s+from\s*(["'`][^"'`\n]+["'`])(\s*with\s*(\{[^}]*\}))?/g, (_, __, default_property = null, properties, path, ___, _with = null) => `const ${default_property !== null ? `{default: ${default_property}, ...${properties}}` : properties} = await import(${path}${_with !== null ? `, {with: ${_with}}` : ""})`).replaceAll(/(^|\s)import\s*(["'`][^"'`\n]+["'`])(\s*with\s*(\{[^}]*\}))?/g, (_, start, path, __, _with = null) => `${start}await import(${path}${_with !== null ? `, {with: ${_with}}` : ""})`);
    }
}
