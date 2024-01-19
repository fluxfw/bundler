import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chmod, readFile, stat, writeFile } from "node:fs/promises";
import { createRequire, isBuiltin } from "node:module";
import { dirname, extname, join, relative, resolve } from "node:path";

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
     * @param {string} input_file
     * @param {string} output_file
     * @param {string[] | null} exclude_modules
     * @param {((css: string) => Promise<string>) | null} minify_css
     * @param {((css: string) => Promise<string>) | null} minify_xml
     * @param {string | null} dev_mode
     * @param {boolean | null} no_top_level_await
     * @returns {Promise<void>}
     */
    async bundle(input_file, output_file, exclude_modules = null, minify_css = null, minify_xml = null, dev_mode = null, no_top_level_await = null) {
        console.log(`Bundle ${output_file}`);

        const _dev_mode = dev_mode ?? false;

        const mode = !existsSync(output_file) ? (await stat(input_file)).mode : null;

        const module_ids = {};

        const modules = _dev_mode ?? false ? {} : [];

        const [
            module_id,
            hash_bang,
            _exports
        ] = await this.#bundle(
            resolve(input_file),
            input_file,
            exclude_modules ?? [],
            !_dev_mode ? minify_css : null,
            !_dev_mode ? minify_xml : null,
            module_ids,
            modules
        );

        const code = await readFile(join(dirname(fileURLToPath(import.meta.url)), "Template", "bundle.mjs"), "utf8");

        await writeFile(output_file, `${hash_bang !== null ? `${hash_bang}\n` : ""}${(no_top_level_await ?? false ? code.replace(/^await /, "") : _exports.length > 0 ? _exports.length === 1 && _exports[0] === "default" ? `${"e"}xport default (${code.replace(/;\n$/, "")}).default;\n` : _exports.includes("default") ? `const __exports__ = ${code}\n${"e"}xport default __exports__.default;\n${"e"}xport const { ${_exports.filter(key => key !== "default").map(key => `    ${key}`).join(", ")} } = __exports__;\n` : `${"e"}xport const { ${_exports.map(key => `    ${key}`).join(", ")} } = ${code}` : code).replaceAll("/*%ROOT_MODULE_ID%*/", JSON.stringify(module_id)).replaceAll("{ /*%INIT_LOADED_MODULES%*/ }", Array.isArray(modules) ? "[]" : "{}").replaceAll("{ /*%MODULES%*/ }", () => Array.isArray(modules) ? `[\n${modules.join(",\n")}\n    ]` : `{\n${Object.entries(modules).map(([
            _module_id,
            module
        ]) => `        ${JSON.stringify(_module_id)}: ${module}`).join(",\n")}\n    }`)}`);

        if (mode !== null) {
            await chmod(output_file, mode);
        }
    }

    /**
     * @param {string} path
     * @param {string} input_file
     * @param {string[]} exclude_modules
     * @param {((css: string) => Promise<string>) | null} minify_css
     * @param {((css: string) => Promise<string>) | null} minify_xml
     * @param {{[key: string]: number | string}} module_ids
     * @param {string[] | {[key: string]: string}} modules
     * @param {string | null} with_type
     * @returns {Promise<[number | string, string | null, string[]]>}
     */
    async #bundle(path, input_file, exclude_modules, minify_css, minify_xml, module_ids, modules, with_type = null) {
        let relative_path;
        switch (true) {
            case isBuiltin(path):
                relative_path = !path.startsWith("node:") ? `node:${path}` : path;
                break;

            case exclude_modules.includes(path):
                relative_path = path;
                break;

            default:
                relative_path = relative(dirname(input_file), path);
                break;
        }

        module_ids[relative_path] ??= Array.isArray(modules) ? modules.length : relative_path;
        const module_id = module_ids[relative_path];

        let hash_bang = null;
        let exports = [];

        if ((modules[module_id] ?? null) === null) {
            modules[module_id] = "";

            let has_load_modules = false;
            let code;

            switch (true) {
                case isBuiltin(path):
                case exclude_modules.includes(path):
                    code = `return import(${JSON.stringify(relative_path)});`;
                    break;

                default:
                    switch (with_type) {
                        case "css": {
                            [
                                code
                            ] = await this.#readFile(
                                path
                            );

                            const require = createRequire(path);

                            for (const [
                                _url,
                                file
                            ] of code.matchAll(/url\(["']?([^"']+)["']?\)/g)) {
                                if (!code.includes(_url) || file.startsWith("data:")) {
                                    continue;
                                }

                                const _file = require.resolve(file);

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

                            code = `const __style_sheet__ = new CSSStyleSheet();\n__style_sheet__.replaceSync(${JSON.stringify(code)});\nreturn { default: __style_sheet__ };`;

                            exports = [
                                "default"
                            ];
                        }
                            break;

                        case "json":
                            code = `return { default: ${(await this.#readFile(
                                path
                            ))[0]} };`;

                            exports = [
                                "default"
                            ];
                            break;

                        default: {
                            let ext = extname(path).substring(1).toLowerCase();

                            if (![
                                "cjs",
                                "js",
                                "mjs"
                            ].includes(ext)) {
                                code = `return import(${JSON.stringify(relative_path)});`;
                                break;
                            }

                            [
                                code,
                                hash_bang
                            ] = await this.#readFile(
                                path
                            );

                            if (ext === "js") {
                                ext = /(^|\n)\s*import\s*[^(]/.test(code) || /(^|\n)\s*export\s/.test(code) || /import\s*\.\s*meta/.test(code) ? "mjs" : "cjs";
                            }

                            if (ext === "cjs") {
                                code = this.#replaceMisleadingKeywordsInComments(
                                    code
                                );

                                const __dirname = code.includes("__dirname");
                                const __filename = code.includes("__filename");

                                code = `${__dirname ? `let { dirname } = await ${"i"}mport("node:path");\n` : ""}${__dirname || __filename ? `let { fileURLToPath } = await ${"i"}mport("node:url");\n` : ""}let module = { exports: {} };\nlet exports = module.exports;${__dirname || __filename ? "\nlet __filename = fileURLToPath(import.meta.url);" : ""}${__dirname ? `\nlet __dirname = dirname(__filename);` : ""}\n${code}\nmodule.exports.default = module.exports;\nreturn module.exports;`;

                                code = this.#replaceRequiresWithDynamicImports(
                                    code
                                );
                            } else {
                                code = this.#replaceMisleadingKeywordsInComments(
                                    code
                                );
                            }

                            code = this.#replaceStaticImportsWithDynamicImports(
                                code
                            );

                            [
                                code,
                                exports
                            ] = this.#replaceExportsWithReturns(
                                code
                            );

                            [
                                has_load_modules,
                                code
                            ] = await this.#replaceDynamicImportsWithLoadModules(
                                path,
                                input_file,
                                exclude_modules,
                                minify_css,
                                minify_xml,
                                module_ids,
                                modules,
                                has_load_modules,
                                code
                            );
                        }
                            break;
                    }
                    break;
            }

            code = code.trim();

            modules[module_id] = `${Array.isArray(modules) ? `        // ${module_id} - ${relative_path}\n        ` : ""}async ${has_load_modules ? "__load_module__" : "()"} => ${!code.startsWith("return ") ? `{\n${code}\n        }` : `${code.includes("{") ? "(" : ""}${code.replaceAll(/(^return |;$)/g, "")}${code.includes("{") ? ")" : ""}`}`;
        }

        return [
            module_id,
            hash_bang,
            exports
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
     * @param {string} path
     * @param {string} input_file
     * @param {string[]} exclude_modules
     * @param {((css: string) => Promise<string>) | null} minify_css
     * @param {((css: string) => Promise<string>) | null} minify_xml
     * @param {{[key: string]: number}} module_ids
     * @param {string[]} modules
     * @param {boolean} has_load_modules
     * @param {string} code
     * @returns {Promise<[boolean, string]>}
     */
    async #replaceDynamicImportsWithLoadModules(path, input_file, exclude_modules, minify_css, minify_xml, module_ids, modules, has_load_modules, code) {
        let _has_load_modules = has_load_modules;
        let _code = code;

        const require = createRequire(path);

        for (const [
            _import,
            start,
            file,
            with_type = null
        ] of [
                ..._code.matchAll(/(^|[\s(,=])import\s*\(\s*["'`]([^"'`\n]+)["'`]\s*\)/g),
                ..._code.matchAll(/(^|[\s(,=])import\s*\(\s*["'`]([^"'`\n]+)["'`]\s*,\s*\{\s*with\s*:\s*\{\s*type\s*:\s*["'`]([^"'`\n]+)["'`]\s*\}\s*\}\s*\)/g)
            ]) {
            if (!_code.includes(_import)) {
                continue;
            }

            _has_load_modules = true;

            _code = _code.replaceAll(_import, `${start}__load_module__(${JSON.stringify((await this.#bundle(
                !exclude_modules.includes(file) ? require.resolve(file) : file,
                input_file,
                exclude_modules,
                minify_css,
                minify_xml,
                module_ids,
                modules,
                with_type
            ))[0])})`);
        }

        return [
            _has_load_modules,
            _code
        ];
    }

    /**
     * @param {string} code
     * @returns {[string, string[]]}
     */
    #replaceExportsWithReturns(code) {
        const exports = [];

        return [
            `${code.replaceAll(/export\s+((async\s+)?(class|const|function|function\*|let|var)\s*(\w+))/g, (_, _export, __, ___, key) => {
                exports.push([
                    key,
                    key
                ]);

                return _export;
            }).replaceAll(/export\s+((const|let|var)\s*[{[]([^}\]]*)[}\]])/g, (_, _export, __, keys) => {
                for (const [
                    key,
                    as = null
                ] of keys.split(",").map(_key => _key.split(":").map(part => part.trim())).filter(([
                    _key
                ]) => _key !== "")) {
                    exports.push([
                        as ?? key,
                        as ?? key
                    ]);
                }

                return _export;
            }).replaceAll(/export\s+(default)\s/g, (_, _default) => {
                exports.push([
                    `${_default}`,
                    `${_default}: __${_default}__`
                ]);

                return `const __${_default}__ = `;
            }).replaceAll(/export\s*\{([^}]*)\}\s*from\s*(["'`][^"'`\n]+["'`])(\s*;+)?/g, (_, keys, from) => {
                const _exports = [];

                for (const [
                    key,
                    as = null
                ] of keys.split(",").map(_key => _key.split(" as ").map(part => part.trim())).filter(([
                    _key
                ]) => _key !== "")) {
                    _exports.push([
                        as ?? key,
                        key
                    ]);
                }

                if (_exports.length === 1) {
                    exports.push([
                        _exports[0][0],
                        `${_exports[0][0]}: (await import(${from})).${_exports[0][1]}`
                    ]);
                } else {
                    for (const [
                        i,
                        [
                            key
                        ]
                    ] of _exports.entries()) {
                        exports.push([
                            key,
                            i === 0 ? `...await (async () => {\n    const __imports__ = await import(${from});\n    return { ${_exports.map(([
                                key_1,
                                _key_2
                            ]) => `${key_1}: __imports__.${_key_2}`).join(", ")} };\n})()` : ""
                        ]);
                    }
                }

                return "";
            }).replaceAll(/export\s*\{([^}]*)\}(\s*;+)?/g, (_, keys) => {
                for (const [
                    key,
                    as = null
                ] of keys.split(",").map(_key => _key.split(" as ").map(part => part.trim())).filter(([
                    _key
                ]) => _key !== "")) {
                    exports.push(as !== null ? [
                        as,
                        `${as}: ${key}`
                    ] : [
                        key,
                        key
                    ]);
                }

                return "";
            }).replaceAll(/export\s+\*(\s+as\s+(\w+))?\s+from\s*(["'`][^"'`\n]+["'`])(\s*;+)?/g, (_, __, key = null, path) => {
                exports.push(key !== null ? [
                    key,
                    `${key}: await import(${path})`
                ] : [
                    "",
                    `...await import(${path})`
                ]);

                return "";
            })}${exports.length > 0 ? `\nreturn Object.freeze({ ${exports.filter(([
                ,
                key
            ]) => key !== "").map(([
                ,
                key
            ]) => key).join(", ")} });` : ""}`,
            exports.filter(([
                key
            ]) => key !== "").map(([
                key
            ]) => key)
        ];
    }

    /**
     * @param {string} code
     * @returns {string}
     */
    #replaceMisleadingKeywordsInComments(code) {
        return code.replaceAll(/(\/\*[\s\S]*?\*\/|\/\/[^\n]*(\n|$))/g, comment => comment.replaceAll(/__dirname|__filename|export|import|require/g, keyword => `__${keyword}__`));
    }

    /**
     * @param {string} code
     * @returns {string}
     */
    #replaceRequiresWithDynamicImports(code) {
        return code.replaceAll(/(^|[\s(,=])require\s*\(\s*(["'`]([^"'`\n]+)["'`])\s*\)/g, (_, start, path, _path) => `${start}(await import(${path}${extname(_path).substring(1).toLowerCase() === "json" ? ", { with: { type: \"json\" } })).default" : "))"}`);
    }

    /**
     * @param {string} code
     * @returns {string}
     */
    #replaceStaticImportsWithDynamicImports(code) {
        return code.replaceAll(/(import\s*)(\w+)(\s*,\s*\{([^}]*)\})?(\s*from)/g, (_, _import, default_property, __, properties = null, from) => `${_import}{\n    default: ${default_property}${properties !== null ? `,\n    ${properties.trim()}` : ""}\n}${from}`).replaceAll(/import\s*(\{[^}]*\})\s*from\s*(["'`][^"'`\n]+["'`])\s*with\s*(\{[^}]*\})/g, (_, properties, path, _with) => `const ${properties.replaceAll(" as ", ": ")} = await import(${path}, { with: ${_with} })`).replaceAll(/import\s*((\w+)\s*,\s*)?\*\s+as\s+(\w+)\s+from\s*(["'`][^"'`\n]+["'`])/g, (_, __, default_property = null, properties, path) => `const ${default_property !== null ? `{\n    default: ${default_property},\n    ...${properties}\n}` : `${properties}`} = await import(${path})`).replaceAll(/import\s*(\{[^}]*\})\s*from\s*(["'`][^"'`\n]+["'`])/g, (_, properties, path) => `const ${properties.replaceAll(" as ", ": ")} = await import(${path})`).replaceAll(/(^|\s)import\s*(["'`][^"'`\n]+["'`])/g, (_, start, path) => `${start}await import(${path})`);
    }
}
