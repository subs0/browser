import { isPlainObject } from "@thi.ng/checks";
import { _NOTIFY_PRERENDER_DOM, _SET_LINK_ATTRS_DOM, } from "../commands";
import { _, $$_VIEW, $$_LOAD, $$_PATH, URL_FULL, URL_DATA, URL_PATH, URL_PAGE, RTR_PREP, RTR_POST, RTR_PRFX, CFG_RUTR, CMD_ARGS, CMD_RESO, CMD_ERRO, DOM_BODY, STATE_DATA, STATE_PATH, } from "@-0/keys";
import { URL2obj } from "@-0/utils";
const route_error = (_acc, _err, _out) => console.warn("Error in URL__ROUTE:", _err);
const e_s = `Prerequisite property: { ${CMD_ARGS}: { ${URL_FULL}: NOT FOUND 🔥 } }`;
const router_opts = (CFG) => {
    const rtr = CFG[CFG_RUTR] || null;
    const pre = CFG[RTR_PREP] || null;
    const pst = CFG[RTR_POST] || null;
    const pfx = CFG[RTR_PRFX] || null;
    const escRGX = /[-/\\^$*+?.()|[\]{}]/g;
    const escaped = string => string.replace(escRGX, "\\$&");
    const RUTR = rtr || CFG;
    const _PREP = (pre && isPlainObject(pre) ? [pre] : pre) || [];
    const _POST = (pst && isPlainObject(pst) ? [pst] : pst) || [];
    const prefix = pfx ? new RegExp(escaped(pfx), "g") : null;
    return { RUTR, _PREP, _POST, prefix };
};
export const __URL__ROUTE = (CFG, SET_STATE) => {
    const { RUTR, _POST, _PREP, prefix } = router_opts(CFG);
    const _SET_ROUTE_PATH = Object.assign(Object.assign({}, SET_STATE), { [CMD_ARGS]: _acc => ({
            [STATE_DATA]: _acc[URL_PATH],
            [STATE_PATH]: [_, $$_PATH],
        }) });
    const ROUTE_SUBTASK = ({ [URL_FULL]: FURL = "" }) => [
        ..._PREP,
        {
            [CMD_ARGS]: FURL ? RUTR(FURL.replace(prefix, "")) : new Error(e_s),
            [CMD_RESO]: (_acc, _res) => (Object.assign(Object.assign({}, (_res && _res[URL_PAGE] && { [URL_PAGE]: _res[URL_PAGE] })), (_res && _res[URL_DATA] && { [URL_DATA]: _res[URL_DATA] }))),
            [CMD_ERRO]: route_error,
        },
        {
            [CMD_ARGS]: FURL ? URL2obj(FURL, prefix) : new Error(e_s),
            [CMD_ERRO]: route_error,
        },
        _SET_ROUTE_PATH,
        ..._POST,
    ];
    return ROUTE_SUBTASK;
};
export const __DOM_URL__ROUTE = (CFG, SET_STATE) => {
    const { RUTR, _POST, _PREP } = router_opts(CFG);
    const UNIVERSAL_ROUTING_SUBTASK = __URL__ROUTE({
        [CFG_RUTR]: RUTR,
        [RTR_PRFX]: CFG[RTR_PRFX] || null,
    }, SET_STATE);
    const _SET_ROUTE_LOADING_TRUE = Object.assign(Object.assign({}, SET_STATE), { [CMD_ARGS]: { [STATE_PATH]: [_, $$_LOAD], [STATE_DATA]: true } });
    const _SET_ROUTE_LOADING_FALSE = Object.assign(Object.assign({}, SET_STATE), { [CMD_ARGS]: { [STATE_PATH]: [_, $$_LOAD], [STATE_DATA]: false } });
    const ROUTE_HOT = (props) => [
        { [CMD_ARGS]: props },
        ..._PREP,
        _SET_ROUTE_LOADING_TRUE,
        props => UNIVERSAL_ROUTING_SUBTASK({ [URL_FULL]: props[URL_FULL] }),
        { [CMD_ARGS]: acc => (Object.assign(Object.assign({}, props), acc)) },
        Object.assign(Object.assign({}, SET_STATE), { [CMD_ARGS]: acc => ({
                [STATE_PATH]: [_, $$_VIEW],
                [STATE_DATA]: acc[URL_PAGE] || (console.error(`no \`${URL_PAGE}\` found for this route`), null),
            }) }),
        Object.assign(Object.assign({}, SET_STATE), { [CMD_ARGS]: acc => ({
                [STATE_PATH]: acc[URL_PATH],
                [STATE_DATA]: (acc[URL_DATA] && acc[URL_DATA][DOM_BODY]) ||
                    acc[URL_DATA] ||
                    (console.warn(`consider returning a \`${URL_DATA}\` property from your router to isolate the data needed for this route`),
                        acc) ||
                    null,
            }) }),
        _SET_LINK_ATTRS_DOM,
        _SET_ROUTE_LOADING_FALSE,
        ..._POST,
        _NOTIFY_PRERENDER_DOM,
    ];
    return ROUTE_HOT;
};
