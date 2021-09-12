/**
 * @module commands/routing
 */
import { URL2obj, Err_missing_props } from "@-0/utils"
import {
    DOM_NODE,
    URL_FULL,
    URL_PATH,
    CMD_SUB$,
    CMD_ARGS,
    CMD_WORK,
    ICommand,
    Command,
    SCROLL_Y,
    SCROLL_X,
    POP_STATE,
    PUSH_STATE,
} from "@-0/keys"
import { DOMnavigated$ } from "../core/stream$"
import { registerCMD } from "@-0/spool"

/**
 * @deprecated Redundant and non-idiomatic method of
 * streaming data (using source stream injection rather than
 * direct run$.next({}) injection)
 *
 * Click handler that mimics DOM navigation by transforming
 * a click event payload to align with the object structure
 * of the native DOM navigation events ('popstate' and
 * 'DOMContentLoaded') payloads, so they can be consumed by
 * the `navigated$` stream
 */
export const navEventHandler = ev => {
    // ev.preventDefault()
    // console.log({ ev })
    const href = ev?.target?.href

    if (!href) console.warn(Err_missing_props("navEventHandler", { target: { href } }))
    const w_href = window.location.href
    const parsed = URL2obj(w_href)
    const w_path = `/${parsed[URL_PATH].join("/")}`
    // handle both absolute and root relative paths
    if (href === w_href || href === w_path) return

    DOMnavigated$.next({
        target: { location: { href } },
        currentTarget: ev.currentTarget,
    })
    return ev
}

/**
 * @deprecated USE NAV COMMAND RETURNED FROM `registerRouterDOM` INSTEAD
 *
 */
export const cmd_nav: ICommand = {
    [CMD_SUB$]: "_NAV",
    [CMD_ARGS]: ev => ev,
    [CMD_WORK]: navEventHandler,
}

const setLinkAttrs = target => {
    document?.body?.querySelectorAll("a[visited]").forEach((el: HTMLLinkElement) => {
        if (el.href === window.location.href) el.setAttribute("active", "")
        else el.removeAttribute("active")
    })
    if (target.setAttribute) {
        target.setAttribute("visited", "")
        target.setAttribute("active", "")
    }
}

/**
 *
 * Routing Command: DOM-specific (internal to /browser only)
 *
 * ### Payload: function
 * default payload `args` signature:
 * ```
 * args: ({ DOM }) => ({ DOM }),
 * ```
 * Input = DOM node reference
 *
 * ### Handler: side-effecting
 * Takes a DOM reference and queries all visited links. Sets
 * current/clicked link as active and sets visted links that
 * don't match current URL to inactive see `setLinkAttrs`
 * function
 *
 */
export const _SET_LINK_ATTRS_DOM: Command = registerCMD({
    [CMD_SUB$]: "_SET_LINK_ATTRS_DOM",
    [CMD_ARGS]: acc => acc,
    [CMD_WORK]: acc => {
        const node = acc[DOM_NODE]
        const props = {
            [DOM_NODE]: node,
        }
        if (node) return setLinkAttrs(node)
        return console.warn(Err_missing_props("_SET_LINK_ATTRS_DOM", props))
    },
})

const getScrollPos = () => ({
    [SCROLL_X]: window.scrollX,
    [SCROLL_Y]: window.scrollY,
})

const scrollodex = new Map()

/**
 * Routing Command:
 * DOM-specific
 * (internal to /browser only)
 *
 * - Payload: function
 * - Handler: side-effecting
 *
 * default payload `args` signature:
 * ```
 * args: ({ URL, NODE }) => ({ URL, NODE }),
 * ```
 * Takes a URL and a DOM reference
 *
 * If the DOM reference is not `window` -> !node.document ->
 * (prevents redundant history entries from back/forward
 * browser navigation), uses `history.pushState` to add the
 * URL (plus the parsed URL from `parse_URL(URL)`) to the
 * `history` object
 *
 * export const DOMnavigated$ = merge({src: [popstate$,
 * DOMContentLoaded$]}).transform(map(x => ({ URL:
 * x.target.location.href, DOM: x.currentTarget })))
 *
 *
 */
export const _PUSHSTATE_IF_HREF = registerCMD({
    [CMD_SUB$]: "_PUSHSTATE_IF_HREF",
    [CMD_ARGS]: ({ [URL_FULL]: url, [DOM_NODE]: node }) => ({
        [URL_FULL]: url,
        [DOM_NODE]: node,
    }),
    [CMD_WORK]: ({ [URL_FULL]: url, [DOM_NODE]: node }) => {
        // has reqs and not from window (e.g., popstate)
        // i.e., from <a href...> click
        if (url && node.href) {
            const state = getScrollPos()
            const href = window.location.href
            //console.log("setting scrollodex for:", href, "to", state)
            scrollodex.set(href, state)
            return window.history.pushState({ [PUSH_STATE]: window.location.href }, document.title, url)
        }
    },
})

if ("scrollRestoration" in window.history) {
    // take control of scroll restoration
    window.history.scrollRestoration = "manual"
}

/**
 * Restores scroll position from popstate events (set during
 * `_PUSHSTATE_IF_HREF`)
 *
 * TODO: test
 */
export const _RESTORE_SCROLL_IF_POPSTATE = registerCMD({
    [CMD_SUB$]: "_RESTORE_SCROLL",
    [CMD_ARGS]: ({ [POP_STATE]: pop, [URL_FULL]: url }) => ({
        [POP_STATE]: pop,
        [URL_FULL]: url,
    }),
    [CMD_WORK]: ({ POP_STATE: pop, [URL_FULL]: url }) => {
        if (pop) {
            //console.log("state popped:", pop)
            const { [SCROLL_X]: x, [SCROLL_Y]: y } = scrollodex.get(url) || {
                [SCROLL_X]: 0,
                [SCROLL_Y]: 0,
            }
            //console.log("scrolling to:", { x, y }, node)
            window.scrollTo(x, y)
        }
    },
})

/**
 * Routing Command: DOM-specific (internal to /browser only)
 *
 * ### args: static
 *
 * ### work: side-effecting
 *
 *
 * Used for manually triggering a prerendering server for
 * bots/web-crawlers
 *
 * TODO: `jsdom` prerender testing
 *
 * basic `http` server that returns static content for
 * certain user-agents
 *
 * import { JSDOM } from "jsdom"
 *
 * const document = (new JSDOM(...)).window.document
 * document.addEventListener("rendered", () => {...scrape
 * stuff here... }
 * )
 */
export const _NOTIFY_PRERENDER_DOM: Command = registerCMD({
    [CMD_SUB$]: "_NOTIFY_PRERENDER_DOM",
    [CMD_ARGS]: true,
    [CMD_WORK]: () => document?.dispatchEvent(new Event("rendered")),
})
