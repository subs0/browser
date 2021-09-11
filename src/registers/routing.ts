/**
 * @module core/registers
 */
import {
    DOM_NODE,
    URL_FULL,
    CMD_SUB$,
    CMD_ARGS,
    CMD_SRC$,
    CMD_WORK,
    Command,
    Router,
    RouterCFG,
    URL_PATH,
    PUSH_STATE,
} from "@-0/keys"
import { run$, registerCMD } from "@-0/spool"
import { Err_missing_props, URL2obj } from "@-0/utils"
import { __DOM_URL__ROUTE } from "../tasks"
import { DOMnavigated$ } from "../core"
import { ICommandObject } from "@-0/keys"
import { SET_STATE } from "../commands"

/**
 *
 * Task alias: Command forwards any validated target
 * emissions to a larger set of Commands via a Task. Expects
 * payload of
 * ```
 * { target: { location: { href } }, currentTarget }
 * ```
 * returns a Command Object whos arguments are expected to
 * fit the signature: { [URL_FULL], [DOM_NODE] }
 *
 * @example
 * ```js
 * import { registerRouterDOM, $store$ } from "@-0/browser"
 * import { URL2obj } from "@-0/utils"
 * import * as K from "@-0/keys"
 * import { getIn } from "@thi.ng/paths"
 *
 * // arbitrary router, always returns the same object
 * const router = (url) => ({
 *      [K.URL_PAGE]: (data) => console.log("🎨:", data),
 *      [K.URL_DATA]: "navigated to " + url
 * })
 *
 * const _NAVIGATE = registerRouterDOM(router)
 * // 🕗 will handle popstate events
 *
 * // can also be called on for on demand routing
 * // (e.g., within a Link component)
 * const url = "/some/path?and=query"
 * run$.next({
 *      ..._NAVIGATE,
 *      [K.CMD_ARGS]: {
 *          [K.URL_FULL]: url,
 *          [K.DOM_NODE]: document
 *      }
 *  })
 *
 * // get the current path to state from URL/route
 * const { [K.URL_PATH]: path } = URL2Obj(url)
 * // get the current view and global state from store
 * const { [K.$$_VIEW]: View, ...store } = $store$.deref()
 * // get route-specific data out of the global state
 * const data = getIn(store, path)
 * // use the view on the data
 * View(data)
 * // => 🎨: navigated to /some/path?and=query
 * ```
 */
export const registerRouterDOM = (CFG: Router | RouterCFG, setStateCMD: Command = SET_STATE) => {
    console.log("DOM Router Registered")
    const ROUTE_HOT = __DOM_URL__ROUTE(CFG, setStateCMD)
    const { [CMD_SUB$]: sub$, [CMD_ARGS]: args } = registerCMD({
        [CMD_SRC$]: DOMnavigated$,
        [CMD_SUB$]: "_NAVIGATE",
        [CMD_ARGS]: ({ [URL_FULL]: url, [DOM_NODE]: node, [PUSH_STATE]: state }) => ({
            [URL_FULL]: url,
            [DOM_NODE]: node,
            [PUSH_STATE]: state,
        }),
        [CMD_WORK]: ({ [URL_FULL]: url, [DOM_NODE]: node = document, [PUSH_STATE]: state }) => {
            const props = { [URL_FULL]: url, [DOM_NODE]: node, [PUSH_STATE]: state }
            if (url) return run$.next(ROUTE_HOT(props))
            console.warn(Err_missing_props("_NAVIGATE (from registerRouterDOM)", props))
        },
    })
    return { [CMD_SUB$]: sub$, [CMD_ARGS]: args }
}
