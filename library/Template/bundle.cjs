module.exports = (
    /**
     * @param {string[] | {[key: string]: string}} commonjs_modules
     * @param {string[] | {[key: string]: string}} es_modules
     * @param {string[] | {[key: string]: string}} init_loaded_modules
     * @param {number | string} root_module_id
     * @returns {*}
     */
    (commonjs_modules, es_modules, init_loaded_modules, root_module_id) => {
        const loaded_commonjs_modules = structuredClone(init_loaded_modules);
        const loaded_es_modules = structuredClone(init_loaded_modules);
        const loaded_commonjs_modules_for_es = structuredClone(init_loaded_modules);

        /**
         * @param {number | string} module_id
         * @returns {Promise<*>}
         */
        async function load_es_module(module_id) {
            loaded_es_modules[module_id] ??= (async () => {
                const exports = {};

                /**
                 * @param {{[key: string]: *}} object
                 * @returns {void}
                 */
                const export_es_object = object => {
                    Object.defineProperties(exports, Object.fromEntries(Object.keys(object).map(key => [
                        key,
                        {
                            configurable: true,
                            enumerable: true,
                            value: object[key]
                        }
                    ])));
                };

                /**
                 * @param {string} key
                 * @param {() => *} get_value
                 * @returns {void}
                 */
                const export_es_key = (key, get_value) => {
                    Object.defineProperty(exports, key, {
                        configurable: true,
                        enumerable: true,
                        get: get_value
                    });
                };

                await es_modules[module_id](
                    load_es_module,
                    load_commonjs_module_for_es,
                    export_es_object,
                    export_es_key,
                    {
                        dirname: __dirname,
                        filename: __filename,
                        resolve: () => {
                            throw new Error("resolve is not supported!");
                        },
                        url: require("node:url").pathToFileURL(__filename)
                    }
                );

                return Object.freeze(exports);
            })();

            return loaded_es_modules[module_id];
        }

        /**
         * @param {number | string} module_id
         * @returns {*}
         */
        function load_commonjs_module(module_id) {
            if (!Object.hasOwn(loaded_commonjs_modules, module_id)) {
                loaded_commonjs_modules[module_id] = null;

                loaded_commonjs_modules[module_id] = (() => {
                    const module = {
                        exports: {}
                    };

                    commonjs_modules[module_id](
                        load_es_module,
                        load_commonjs_module_for_es,
                        load_commonjs_module,
                        module,
                        module.exports,
                        require,
                        __filename,
                        __dirname
                    );

                    return module.exports ?? Object.freeze({});
                })();
            }

            return loaded_commonjs_modules[module_id] ?? new Proxy(Object.freeze({}), {
                get: (target, key) => (loaded_commonjs_modules[module_id] ?? target)[key]
            });
        }

        /**
         * @param {number | string} module_id
         * @returns {Promise<*>}
         */
        async function load_commonjs_module_for_es(module_id) {
            loaded_commonjs_modules_for_es[module_id] ??= (async () => {
                const exports = load_commonjs_module(
                    module_id
                );

                return Object.freeze(Object.defineProperties({}, Object.fromEntries([
                    ...Object.keys(exports).filter(key => key !== "default"),
                    "default"
                ].map(key => [
                    key,
                    {
                        configurable: true,
                        enumerable: true,
                        get: key === "default" ? () => exports : () => exports[key]
                    }
                ]))));
            })();

            return loaded_commonjs_modules_for_es[module_id];
        }

        return load_commonjs_module(
            root_module_id
        );
    })(
        "%COMMONJS_MODULES%",
        "%ES_MODULES%",
        "%INIT_LOADED_MODULES%",
        "%ROOT_MODULE_ID%"
    );
