import { CMD_SUB$, CMD_ARGS, CMD_WORK, STATE_DATA, STATE_PATH } from "@-0/keys";
import { set$$tate, $store$ } from "../store";
import { registerCMD } from "@-0/spool";
import { Err_missing_props } from "@-0/utils";
export const createSetStateCMD = (store = $store$, sub$ = "_SET_STATE") => registerCMD({
    [CMD_SUB$]: sub$,
    [CMD_ARGS]: ({ [STATE_PATH]: path, [STATE_DATA]: data }) => ({
        [STATE_PATH]: path,
        [STATE_DATA]: data,
    }),
    [CMD_WORK]: ({ [STATE_PATH]: path, [STATE_DATA]: data }) => {
        const props = {
            [STATE_PATH]: path,
            [STATE_DATA]: data,
        };
        if (path && data !== undefined)
            return set$$tate(path, data, store);
        console.warn(Err_missing_props(sub$, props));
    },
});
export const SET_STATE = createSetStateCMD();
