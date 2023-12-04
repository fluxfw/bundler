await (async modules => {
    const loaded_modules = { /*%INIT_MODULES%*/ };

    /**
     * @param {number | string} id
     * @returns {Promise<{[key: string]: *}>}
     */
    const load_module = async id => {
        if (!Object.hasOwn(loaded_modules, id)) {
            loaded_modules[id] = null;

            loaded_modules[id] = await modules[id](
                load_module
            ) ?? {};
        } else {
            if (loaded_modules[id] === null) {
                console.warn(`Parallel load module ${id}`);

                await (async function wait() {
                    await new Promise(resolve => {
                        setTimeout(() => {
                            if (loaded_modules[id] === null) {
                                console.warn(`Parallel load module ${id} still unavailable`);

                                resolve(wait(1));
                            } else {
                                resolve();
                            }
                        }, 500);
                    });
                })();
            }
        }

        return loaded_modules[id];
    };

    return load_module(
        /*%ROOT_MODULE_ID%*/
    );
})(
    { /*%MODULES%*/ }
);
