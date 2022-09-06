/**
 * @module tasks/routing
 */

import { isPlainObject } from "@thi.ng/checks"

import {
    _PUSHSTATE_IF_HREF,
    _RESTORE_SCROLL_IF_POPSTATE,
    //SET_STATE,
    //_NOTIFY_PRERENDER_DOM,
    _SET_LINK_ATTRS_DOM,
    _SCROLL_TO_HASH,
} from "../commands"

import {
    _,
    $$_VIEW,
    $$_LOAD,
    $$_PATH,
    DOM_NODE,
    URL_FULL,
    URL_DATA,
    URL_PATH,
    URL_PAGE,
    RTR_PREP,
    RTR_POST,
    RTR_PRFX,
    CFG_RUTR,
    CMD_ARGS,
    CMD_RESO,
    CMD_WORK,
    CMD_ERRO,
    DOM_BODY,
    DOM_HEAD,
    HEAD,
    STATE_DATA,
    STATE_PATH,
    RouterCFG,
    Router,
    Task,
    HOTask,
    RouterOutput,
    Command,
    CMD_SUB$,
    ICommandObject,
    PUSH_STATE,
    Accumulator,
    POP_STATE,
} from "@-0/keys"

import { URL2obj } from "@-0/utils"
import { $store$ } from "../store"
import { out$, registerCMD } from "@-0/spool"

const route_error = (_acc, _err, _out) => console.warn("Error in URL__ROUTE:", _err)
const e_s = `Prerequisite property: { ${CMD_ARGS}: { ${URL_FULL}: NOT FOUND 🔥 } }`

const router_opts = (CFG: Router | RouterCFG) => {
    const rtr = CFG[CFG_RUTR] || null
    const pre = CFG[RTR_PREP] || null
    const pst = CFG[RTR_POST] || null
    const pfx = CFG[RTR_PRFX] || null
    const escRGX = /[-/\\^$*+?.()|[\]{}]/g
    const escaped = string => string.replace(escRGX, "\\$&")

    const urlToPageState = rtr || CFG
    const PREP = (pre && isPlainObject(pre) ? [pre] : pre) || []
    const POST = (pst && isPlainObject(pst) ? [pst] : pst) || []
    const prefix = pfx ? new RegExp(escaped(pfx), "g") : null

    return { urlToPageState, PREP, POST, prefix }
}
/**
 *
 * Universal router (cross-platform) Subtask.
 *
 * This can be used in both a browser and Node context. The
 * parts that handle browser side-effects are included in an
 * Supertask `_URL__ROUTE`
 *
 * Pseudo
 * ```
 * ( router ) => ({ URL }) => [
 *  - set `router_loading` path in global atom to `true`
 *  - call provided `router` with the `URL` and await payload
 *  - `URL2obj(URL)` for `URL_*` components
 *  - set `route_path` in global store/atom to current `URL_path`
 *  - set page state (data, path & page component name) in store
 *  - once promise(s) resolved, set `router_loading` to `false`
 * ]
 * ```
 * reserved Command keys:
 *  - `URL_page`
 *  - `URL_data`
 *  - `URL_path`
 *  - `URL`
 *  - `DOM`
 *
 */
export const __URL__ROUTE = (CFG: Router | RouterCFG, SET_STATE: Command): HOTask => {
    const { urlToPageState, POST = [], PREP = [], prefix } = router_opts(CFG)

    //console.log({ SET_STATE, topics: out$.topics.entries() })
    const _SET_ROUTE_PATH = {
        ...SET_STATE,
        [CMD_ARGS]: _acc => ({
            [STATE_DATA]: _acc[URL_PATH],
            [STATE_PATH]: [_, $$_PATH],
        }),
    }
    /**
     * 📌 TODO enable progress observation by using both the
     * run$ and log$ stream emissions:
     * 1. for each run$ emissions, measure length of:
     *      a. single command = 1
     *      b. task = task.length
     * 2. create for every emission from
     *      the run$ emission
     */
    const ROUTE_SUBTASK = ({ [URL_FULL]: FURL = "" }): Task => [
        ...PREP,
        {
            // 📌 🤔: consider how to handle stage flag URL prefix (e.g., /staging, from AWS)
            [CMD_ARGS]: FURL ? urlToPageState(FURL.replace(prefix, "")) : new Error(e_s),
            [CMD_RESO]: (_acc, _res: RouterOutput) => ({
                // no page when used server-side...
                ...(_res && _res[URL_PAGE] && { [URL_PAGE]: _res[URL_PAGE] }),
                ...(_res && _res[URL_DATA] && { [URL_DATA]: _res[URL_DATA] }),
            }),
            [CMD_ERRO]: route_error,
        },
        {
            [CMD_ARGS]: FURL ? URL2obj(FURL, prefix) : new Error(e_s),
            [CMD_ERRO]: route_error,
        },
        _SET_ROUTE_PATH,
        ...POST,
    ]
    return ROUTE_SUBTASK
}

const conflict_warning = `
👀 You are setting state at the root of the store. Be careful!
Consider returning a \`${URL_DATA}\` property from your router 
with a keyed object value (e.g., { data: {...}}) to isolate the 
data needed for this route from other root state configuration
`

const no_data_warning = path => `
No data (\`${URL_DATA}\`) hydrated @\`${URL_PATH}\`: ${path ? path : "/"}
`
//const LOG_PROP = (PROP: string) =>
//    registerCMD({
//        [CMD_SUB$]: "_LOG_PROP_" + PROP,
//        // @ts-ignore
//        [CMD_ARGS]: ({ [PROP]: target }) => target,
//        [CMD_WORK]: x => console.log("Logging for _LOG_" + x, x),
//    })

//const LOG_POP_STATE = LOG_PROP(POP_STATE)
//const LOG_PUSH_STATE = LOG_PROP(PUSH_STATE)
/**
 *
 * DOM Router that contains a cross-platform routing Subtask
 *
 * Subtask HOF for router registration. Takes a
 * `@thi.ng/associative` `EquivMap` route matching function,
 * registers that router as a member of a Task for following
 * Commands to leverage the returned data (`{ data, page }`)
 *
 * Pseudo
 * ```
 * ( router ) => ({ URL, DOM event }) => [
 *  - if href, push to `history.pushState`
 *  - SUBTASK: _URL__ROUTE (universal router)
 *  - remove `active` attribute from visited links except current
 *  - notify rendertron (TBD) of new page
 * ]
 * ```
 */
export const __DOM_URL__ROUTE = (CFG: Router | RouterCFG, SET_STATE: Command): HOTask => {
    const { urlToPageState, POST, PREP } = router_opts(CFG)

    // instantiate router
    const UNIVERSAL_ROUTING_SUBTASK = __URL__ROUTE(
        {
            [CFG_RUTR]: urlToPageState,
            [RTR_PRFX]: CFG[RTR_PRFX] || null,
        },
        SET_STATE
    )

    const _SET_ROUTE_LOADING_TRUE = {
        ...SET_STATE,
        [CMD_ARGS]: { [STATE_PATH]: [_, $$_LOAD], [STATE_DATA]: true },
    }
    const _SET_ROUTE_LOADING_FALSE = {
        ...SET_STATE,
        [CMD_ARGS]: { [STATE_PATH]: [_, $$_LOAD], [STATE_DATA]: false },
    }

    const _SET_ROUTE_VIEW_TO_PAGE = {
        // set page component/function
        ...SET_STATE,
        [CMD_ARGS]: acc => ({
            [STATE_PATH]: [_, $$_VIEW],
            [STATE_DATA]: acc[URL_PAGE] || (console.error(`no \`${URL_PAGE}\` found for this route`), null),
        }),
    }

    const HACKED_API_FIXME = async () => await new Promise(resolve => setTimeout(() => resolve({}), 0))

    const _SET_PATH_STATE_DATA = {
        // hydrate page state
        ...SET_STATE,
        [CMD_ARGS]: acc => {
            const { [URL_DATA]: data, [URL_PATH]: path } = acc
            // no data at non-base/non-home route
            if (!data) {
                console.log(no_data_warning(acc[URL_PATH]))
                if (!path?.length) console.log(conflict_warning)
                return {
                    [STATE_PATH]: path,
                    /**
                     * {}: stub out data placeholder for independent pages
                     * acc: full accumulator for downstream dependencies
                     **/
                    [STATE_DATA]: {}, // path?.length ? {} : acc,
                }
            }
            const { [DOM_BODY]: body, [DOM_HEAD]: head } = data
            return {
                [STATE_PATH]: path,
                /**
                 * !head && !body: non-nested payload configuration
                 * head && !body: no data requisites for route = stub route {}
                 * !head && body: nested payload = use body at path
                 * head && body: nested payload = use body at path
                 * TODO: consider if && how to handle non segregated root payloads
                 */
                [STATE_DATA]: !head && !body ? data : head && !body ? {} : body,
            }

            //return {
            //    [STATE_PATH]: path,
            //    // TODO: enable synchronous calls to line up correctly
            //    [STATE_DATA]:
            //        (acc[URL_DATA] && acc[URL_DATA][DOM_BODY]) ||
            //        acc[URL_DATA] ||
            //        (acc && console.warn(conflict_warning), acc) ||
            //        console.warn(no_data_warning(acc[URL_PATH]), null),
            //}
        },
    }

    const ROUTE_HOT = (args): Task => [
        ...PREP,
        _SET_ROUTE_LOADING_TRUE,
        { [CMD_ARGS]: args }, // Seed accumulator
        _PUSHSTATE_IF_HREF, // deps: DOM_NODE
        args => UNIVERSAL_ROUTING_SUBTASK({ [URL_FULL]: args[URL_FULL] }),
        _SET_PATH_STATE_DATA,
        _SET_ROUTE_VIEW_TO_PAGE,
        _SET_LINK_ATTRS_DOM, // deps: DOM_NODE
        _SET_ROUTE_LOADING_FALSE,
        _RESTORE_SCROLL_IF_POPSTATE,
        _SCROLL_TO_HASH,
        ...POST,
    ]

    return ROUTE_HOT
}
