//import { createEvent, fireEvent, getByText } from "@testing-library/dom"
import { getIn } from "@thi.ng/paths"
//import { EquivMap } from "@thi.ng/associative"
//import { map } from "@thi.ng/transducers"

import {
    _,
    URL_FULL,
    DOM_NODE,
    CMD_ARGS,
    URL_DATA,
    URL_PAGE,
    URL_PATH,
    $$_LOAD,
    $$_VIEW,
    $$_PATH,
    CFG_RUTR,
    RTR_POST,
    RTR_PREP,
    RTR_PRFX,
    CMD_SUB$,
    CMD_WORK,
    DOM_BODY,
    DOM_HEAD,
} from "@-0/keys"

import { registerCMD, run$, log$ } from "@-0/spool"
import { $store$ } from "../../src/store"
import { SET_STATE } from "../../src/commands"
import { __URL__ROUTE, __DOM_URL__ROUTE } from "../../src/tasks"
import { setImmediate } from "timers"
import { stringify_fn } from "@-0/utils"

const router_fn = url => ({ [URL_DATA]: { here: "worn out places" }, [URL_PAGE]: "({ I }) => am a function" })

const router_fn_empty =
    (version = "lonely") =>
    url =>
        ({
            lonely: { [URL_PAGE]: x => `I have no ${URL_DATA} -> ${JSON.stringify(x)}` },
            null_data: { [URL_DATA]: null, [URL_PAGE]: x => `My ${URL_DATA}: \`null\` -> ${JSON.stringify(x)}` },
            bodyless_head: {
                [URL_DATA]: {
                    [DOM_HEAD]: {},
                },
                [URL_PAGE]: x => `I use ${DOM_HEAD}, but no ${DOM_BODY} -> ${JSON.stringify(x)}`,
            },
            null_body: {
                [URL_DATA]: {
                    [DOM_BODY]: null,
                    [DOM_HEAD]: {},
                },
                [URL_PAGE]: x => `I use ${DOM_HEAD}, but my ${DOM_BODY}: \`null\` -> ${JSON.stringify(x)}`,
            },
        }[version])

const spyScrollTo = jest.fn()

describe("Tasks: routing", () => {
    beforeEach(() => {
        Object.defineProperty(global.window, "scrollTo", { value: spyScrollTo })
        Object.defineProperty(global.window, "scrollY", { value: 1 })
        spyScrollTo.mockClear()
    })

    test("1: __URL__ROUTE: function router CFG with simple data", async () => {
        const SUBTASK = __URL__ROUTE(router_fn, SET_STATE)
        const before = $store$.deref()
        expect(before[_][$$_PATH]).toMatchObject([])
        run$.next([{ [CMD_ARGS]: { [URL_FULL]: "logan/was/here", [DOM_NODE]: window } }, SUBTASK])

        await new Promise(r => setImmediate(r))

        const after = $store$.deref()
        expect(after[_][$$_PATH]).toMatchObject(["logan", "was", "here"])
    })
    test("2: __URL__ROUTE: Object router CFG with simple data", async () => {
        // Object router configuration
        const router_obj = {
            [CFG_RUTR]: router_fn,
            [RTR_PRFX]: "nowyouseeme/",
        }

        const SUBTASK2 = __URL__ROUTE(router_obj, SET_STATE)

        run$.next([{ [CMD_ARGS]: { [URL_FULL]: "nowyouseeme/now/you/dont", [DOM_NODE]: window } }, SUBTASK2])

        // wait for next tick/cycle of event loop
        await new Promise(r => setImmediate(r))

        const after = $store$.deref()
        expect(after[_][$$_PATH]).toMatchObject(["now", "you", "dont"])
    })
    test("3: __DOM_URL__ROUTE: function router CFG with simple data", async () => {
        const SUBTASK = __DOM_URL__ROUTE(router_fn, SET_STATE)

        run$.next([{ [CMD_ARGS]: { [URL_FULL]: "exit/stage", [DOM_NODE]: window } }, SUBTASK])

        // wait for next tick/cycle of event loop
        await new Promise(r => setImmediate(r))

        const after = $store$.deref()
        expect(after).toMatchObject({
            [_]: {
                [$$_PATH]: ["exit", "stage"],
                [$$_LOAD]: false,
                [$$_VIEW]: "({ I }) => am a function",
                //$$_ROOT: null,
            },
            exit: { stage: { here: "worn out places" } },
        })
    })

    test(`4: __DOM_URL__ROUTE: Object router CFG with \`${RTR_PRFX}\` + \`${RTR_POST}\``, async () => {
        //log$.subscribe(map(x => console.log("log$:", x)))
        const pre_spy = jest.fn(({ y }) => ({ z: y * y }))
        const PRE = registerCMD({
            [CMD_SUB$]: "PRE",
            [CMD_ARGS]: ({ x }) => ({ y: x * x }),
            [CMD_WORK]: pre_spy,
        })

        const post_spy = jest.fn(({ z }) => ({ a: z + 1 }))
        const POST = registerCMD({
            [CMD_SUB$]: "POST",
            [CMD_ARGS]: ({ y }) => ({ z: y + 1 }),
            [CMD_WORK]: post_spy,
        })

        // Object router configuration
        const router_obj = {
            [CFG_RUTR]: router_fn,
            [RTR_PREP]: [{ [CMD_ARGS]: { x: 2 } }, PRE],
            [RTR_POST]: POST,
            [RTR_PRFX]: "allaroundme/",
        }

        const SUBTASK2 = __DOM_URL__ROUTE(router_obj, SET_STATE)

        run$.next([
            { [CMD_ARGS]: { [URL_FULL]: "allaroundme/are/familiar/faces", [DOM_NODE]: { target: { href: "bloop" } } } },
            SUBTASK2,
        ])

        // wait for next tick/cycle of event loop
        await new Promise(r => setImmediate(r))

        const after = $store$.deref()

        //console.log({ after: stringify_fn(after, 2) })
        expect(pre_spy.mock.results[0].value).toMatchObject({ z: 16 })
        expect(post_spy.mock.results[0].value).toMatchObject({ a: 6 })

        expect(getIn(after, ["are", "familiar", "faces"])).toMatchObject({ here: "worn out places" })
    })
    test("5: __DOM_URL__ROUTE: home page w/no data hydration - lonely at root", async () => {
        $store$.reset() // clear out existing state from prior tests
        const router = router_fn_empty("lonely")
        const SUBTASK = __DOM_URL__ROUTE(router, SET_STATE)

        run$.next([{ [CMD_ARGS]: { [URL_FULL]: "http://bloop.com", [DOM_NODE]: window } }, SUBTASK])

        // wait for next tick/cycle of event loop
        await new Promise(r => setImmediate(r))

        const after = $store$.deref()
        const View = after[_][$$_VIEW]
        const state = getIn(after, after[_][$$_PATH])
        const Page = View(state)

        expect(Page).toEqual(`I have no ${URL_DATA} -> {\"${_}\":{\"${$$_LOAD}\":false,\"${$$_PATH}\":[]}}`)

        expect(after).toMatchObject({
            [_]: {
                [$$_PATH]: [],
                [$$_LOAD]: false,
                [$$_VIEW]: View,
                //$$_ROOT: null,
            },
        })
    })

    test("6: __DOM_URL__ROUTE: home page w null data", async () => {
        const router = router_fn_empty("null_data")
        const SUBTASK = __DOM_URL__ROUTE(router, SET_STATE)

        run$.next([{ [CMD_ARGS]: { [URL_FULL]: "http://bloop.com", [DOM_NODE]: window } }, SUBTASK])

        // wait for next tick/cycle of event loop
        await new Promise(r => setImmediate(r))

        const after = $store$.deref()
        const View = after[_][$$_VIEW]
        const state = getIn(after, after[_][$$_PATH])
        const Page = View(state)

        expect(Page).toEqual(`My ${URL_DATA}: \`null\` -> {\"${_}\":{\"${$$_LOAD}\":false,\"${$$_PATH}\":[]}}`)

        expect(after).toMatchObject({
            [_]: {
                [$$_PATH]: [],
                [$$_LOAD]: false,
                [$$_VIEW]: View,
                //$$_ROOT: null,
            },
        })
    })
    test("7: __DOM_URL__ROUTE: home page w/head data, but no body data", async () => {
        const router = router_fn_empty("bodyless_head")
        const SUBTASK = __DOM_URL__ROUTE(router, SET_STATE)

        run$.next([{ [CMD_ARGS]: { [URL_FULL]: "http://bloop.com", [DOM_NODE]: window } }, SUBTASK])

        // wait for next tick/cycle of event loop
        await new Promise(r => setImmediate(r))

        const after = $store$.deref()
        const View = after[_][$$_VIEW]
        const state = getIn(after, after[_][$$_PATH])
        const Page = View(state)

        expect(Page).toEqual(
            `I use ${DOM_HEAD}, but no ${DOM_BODY} -> {\"${_}\":{\"${$$_LOAD}\":false,\"${$$_PATH}\":[]}}`
        )

        expect(after).toMatchObject({
            [_]: {
                [$$_PATH]: [],
                [$$_LOAD]: false,
                [$$_VIEW]: View,
                //$$_ROOT: null,
            },
        })
    })
    test("8: __DOM_URL__ROUTE: home page w/head data, and body data = null", async () => {
        const router = router_fn_empty("null_body")
        const SUBTASK = __DOM_URL__ROUTE(router, SET_STATE)

        run$.next([{ [CMD_ARGS]: { [URL_FULL]: "http://bloop.com", [DOM_NODE]: window } }, SUBTASK])

        // wait for next tick/cycle of event loop
        await new Promise(r => setImmediate(r))

        const after = $store$.deref()
        const View = after[_][$$_VIEW]
        const state = getIn(after, after[_][$$_PATH])
        const Page = View(state)

        expect(Page).toEqual(
            `I use ${DOM_HEAD}, but my ${DOM_BODY}: \`null\` -> {\"${_}\":{\"${$$_LOAD}\":false,\"${$$_PATH}\":[]}}`
        )

        expect(after).toMatchObject({
            [_]: {
                [$$_PATH]: [],
                [$$_LOAD]: false,
                [$$_VIEW]: View,
                //$$_ROOT: null,
            },
        })
    })
    test("9: __DOM_URL__ROUTE: non-home page w/head data, and body data = null", async () => {
        const router = router_fn_empty("null_body")
        const SUBTASK = __DOM_URL__ROUTE(router, SET_STATE)

        run$.next([{ [CMD_ARGS]: { [URL_FULL]: "http://bloop.com/outside", [DOM_NODE]: window } }, SUBTASK])

        // wait for next tick/cycle of event loop
        await new Promise(r => setImmediate(r))

        const after = $store$.deref()
        const View = after[_][$$_VIEW]
        const state = getIn(after, after[_][$$_PATH])
        const Page = View(state)

        expect(Page).toEqual(`I use ${DOM_HEAD}, but my ${DOM_BODY}: \`null\` -> {}`)

        expect(after).toMatchObject({
            [_]: {
                [$$_PATH]: ["outside"],
                [$$_LOAD]: false,
                [$$_VIEW]: View,
                //$$_ROOT: null,
            },
        })
    })
})
