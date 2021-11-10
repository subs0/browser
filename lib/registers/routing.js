import { DOM_NODE, URL_FULL, CMD_SUB$, CMD_ARGS, CMD_SRC$, CMD_WORK, POP_STATE, } from "@-0/keys";
import { run$, registerCMD } from "@-0/spool";
import { Err_missing_props } from "@-0/utils";
import { __DOM_URL__ROUTE } from "../tasks";
import { DOMnavigated$ } from "../core";
import { SET_STATE } from "../commands";
export const registerRouterDOM = (CFG, setStateCMD = SET_STATE) => {
    console.log("DOM Router Registered");
    const ROUTE_HOT = __DOM_URL__ROUTE(CFG, setStateCMD);
    const { [CMD_SUB$]: sub$, [CMD_ARGS]: args } = registerCMD({
        [CMD_SRC$]: DOMnavigated$,
        [CMD_SUB$]: "_NAVIGATE",
        [CMD_ARGS]: ({ [URL_FULL]: url, [DOM_NODE]: node, [POP_STATE]: pop }) => ({
            [URL_FULL]: url,
            [DOM_NODE]: node,
            [POP_STATE]: pop,
        }),
        [CMD_WORK]: args => {
            const { [URL_FULL]: url } = args;
            if (url)
                return run$.next(ROUTE_HOT(args));
            console.warn(Err_missing_props("_NAVIGATE (from registerRouterDOM)", { [URL_FULL]: url }));
        },
    });
    return { [CMD_SUB$]: sub$, [CMD_ARGS]: args };
};
