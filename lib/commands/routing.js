import { URL2obj, Err_missing_props } from "@-0/utils";
import { DOM_NODE, URL_FULL, URL_PATH, CMD_SUB$, CMD_ARGS, CMD_WORK, SCROLL_Y, SCROLL_X, POP_STATE, PUSH_STATE, } from "@-0/keys";
import { DOMnavigated$ } from "../core/stream$";
import { registerCMD } from "@-0/spool";
export const navEventHandler = ev => {
    var _a;
    const href = (_a = ev === null || ev === void 0 ? void 0 : ev.target) === null || _a === void 0 ? void 0 : _a.href;
    if (!href)
        console.warn(Err_missing_props("navEventHandler", { target: { href } }));
    const w_href = window.location.href;
    const parsed = URL2obj(w_href);
    const w_path = `/${parsed[URL_PATH].join("/")}`;
    if (href === w_href || href === w_path)
        return;
    DOMnavigated$.next({
        target: { location: { href } },
        currentTarget: ev.currentTarget,
    });
    return ev;
};
export const cmd_nav = {
    [CMD_SUB$]: "_NAV",
    [CMD_ARGS]: ev => ev,
    [CMD_WORK]: navEventHandler,
};
const setLinkAttrs = target => {
    var _a;
    (_a = document === null || document === void 0 ? void 0 : document.body) === null || _a === void 0 ? void 0 : _a.querySelectorAll("a[visited]").forEach((el) => {
        if (el.href === window.location.href)
            el.setAttribute("active", "");
        else
            el.removeAttribute("active");
    });
    if (target.setAttribute) {
        target.setAttribute("visited", "");
        target.setAttribute("active", "");
    }
};
export const _SET_LINK_ATTRS_DOM = registerCMD({
    [CMD_SUB$]: "_SET_LINK_ATTRS_DOM",
    [CMD_ARGS]: acc => acc,
    [CMD_WORK]: acc => {
        const node = acc[DOM_NODE];
        const props = {
            [DOM_NODE]: node,
        };
        if (node)
            return setLinkAttrs(node);
        return console.warn(Err_missing_props("_SET_LINK_ATTRS_DOM", props));
    },
});
const getScrollPos = () => ({
    [SCROLL_X]: window.scrollX,
    [SCROLL_Y]: window.scrollY,
});
const scrollodex = new Map();
export const _PUSHSTATE_IF_HREF = registerCMD({
    [CMD_SUB$]: "_PUSHSTATE_IF_HREF",
    [CMD_ARGS]: ({ [URL_FULL]: url, [DOM_NODE]: node }) => ({
        [URL_FULL]: url,
        [DOM_NODE]: node,
    }),
    [CMD_WORK]: ({ [URL_FULL]: url, [DOM_NODE]: node }) => {
        if (url && node.href) {
            const state = getScrollPos();
            const href = window.location.href;
            scrollodex.set(href, state);
            return window.history.pushState({ [PUSH_STATE]: window.location.href }, document.title, url);
        }
    },
});
if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
}
export const _RESTORE_SCROLL_IF_POPSTATE = registerCMD({
    [CMD_SUB$]: "_RESTORE_SCROLL",
    [CMD_ARGS]: ({ [POP_STATE]: pop, [URL_FULL]: url }) => ({
        [POP_STATE]: pop,
        [URL_FULL]: url,
    }),
    [CMD_WORK]: ({ POP_STATE: pop, [URL_FULL]: url }) => {
        if (pop) {
            const { [SCROLL_X]: x, [SCROLL_Y]: y } = scrollodex.get(url) || {
                [SCROLL_X]: 0,
                [SCROLL_Y]: 0,
            };
            window.scrollTo(x, y);
        }
    },
});
export const _SCROLL_TO_HASH = registerCMD({
    [CMD_SUB$]: "_SCROLL_TO_HASH",
    [CMD_ARGS]: ({ [URL_FULL]: url }) => ({ [URL_FULL]: url }),
    [CMD_WORK]: ({ [URL_FULL]: url }) => {
        const { _HASH } = URL2obj(url);
        if (_HASH) {
            const el = document.getElementById(_HASH);
            el.scrollIntoView({ behavior: "smooth" });
        }
    },
});
export const _NOTIFY_PRERENDER_DOM = registerCMD({
    [CMD_SUB$]: "_NOTIFY_PRERENDER_DOM",
    [CMD_ARGS]: true,
    [CMD_WORK]: () => document === null || document === void 0 ? void 0 : document.dispatchEvent(new Event("rendered")),
});
