import { DOM_NODE, URL_FULL, CMD_SUB$, CMD_ARGS, CMD_SRC$, CMD_WORK, } from "@-0/keys";
import { run$, registerCMD } from "@-0/spool";
import { Err_missing_props } from "@-0/utils";
import { __DOM_URL__ROUTE } from "../tasks";
import { DOMnavigated$ } from "../core";
import { SET_STATE } from "../commands";
const PUSH_STATE = "PUSH_STATE";
export const registerRouterDOM = (CFG, setStateCMD = SET_STATE) => {
    console.log("DOM Router Registered");
    const ROUTE_HOT = __DOM_URL__ROUTE(CFG, setStateCMD);
    const { [CMD_SUB$]: sub$, [CMD_ARGS]: args } = registerCMD({
        [CMD_SRC$]: DOMnavigated$,
        [CMD_SUB$]: "_NAVIGATE",
        [CMD_ARGS]: ({ [URL_FULL]: url, [DOM_NODE]: node, [PUSH_STATE]: state }) => ({
            [URL_FULL]: url,
            [DOM_NODE]: node,
            [PUSH_STATE]: state,
        }),
        [CMD_WORK]: ({ [URL_FULL]: url, [DOM_NODE]: node = document, [PUSH_STATE]: state }) => {
            const props = { [URL_FULL]: url, [DOM_NODE]: node, [PUSH_STATE]: state };
            if (url)
                return run$.next(ROUTE_HOT(props));
            console.warn(Err_missing_props("_NAVIGATE (from registerRouterDOM)", props));
        },
    });
    return { [CMD_SUB$]: sub$, [CMD_ARGS]: args };
};
