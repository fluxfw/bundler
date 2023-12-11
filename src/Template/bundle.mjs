await (async modules => {
    const STATUS_NONE = "none";
    const STATUS_LOAD = "load";
    const STATUS_SUCCESS = "success";
    const STATUS_ERROR = "error";

    const status = { /*%INIT_STATUS%*/ };

    /**
     * @param {number | string} id
     * @returns {Promise<{[key: string]: *}>}
     */
    const load_module = async id => {
        switch (status[id]?.[0] ?? STATUS_NONE) {
            case STATUS_NONE:
                status[id] = [
                    STATUS_LOAD
                ];

                try {
                    status[id] = [
                        STATUS_SUCCESS,
                        await modules[id](
                            load_module
                        ) ?? {}
                    ];

                    return status[id][1];
                } catch (error) {
                    status[id] = [
                        STATUS_ERROR,
                        error
                    ];

                    throw status[id][1];
                }

            case STATUS_LOAD:
                await (async function wait() {
                    await new Promise(resolve => {
                        setTimeout(() => {
                            if (status[id][0] !== STATUS_LOAD) {
                                resolve();
                            } else {
                                console.warn(`Parallel load module ${id} still unavailable`);

                                resolve(wait());
                            }
                        }, 1_000);
                    });
                })();

                if (status[id][0] === STATUS_SUCCESS) {
                    return status[id][1];
                } else {
                    throw status[id][1];
                }

            case STATUS_SUCCESS:
                return status[id][1];

            case STATUS_ERROR:
                throw status[id][1];

            default:
                throw new Error(`Invalid status ${status[id]} for module ${id}`);
        }
    };

    return load_module(
        /*%ROOT_MODULE_ID%*/
    );
})(
    { /*%MODULES%*/ }
);
