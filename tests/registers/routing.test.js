import { createEvent, fireEvent } from "@testing-library/dom"
import { EquivMap } from "@thi.ng/associative"
import { map } from "@thi.ng/transducers"
import { setImmediate } from "timers"

import {
    URL_FULL,
    DOM_NODE,
    CFG_RUTR,
    ROUTER_PREP,
    ROUTER_POST,
    ROUTER_PRFX,
    URL_PAGE,
    URL_DATA,
    CMD_ARGS,
    CMD_SUB$,
    CMD_WORK,
} from "@-0/keys"
import { log$, out$, run$, cmd$ } from "@-0/spool"
import { URL2obj } from "@-0/utils"
import { registerRouterDOM } from "../../src/registers"

//const warned = (x = jest.fn()) => (jest.spyOn(console, "warn").mockImplementation(x), x)

const warned = jest.spyOn(console, "warn").mockImplementation()
describe("registerRouterDOM && Warnings due to root value of router output", () => {
    const router_fn = url => ({ [URL_DATA]: true, [URL_PAGE]: 1 })
    registerRouterDOM(router_fn)
    const spy = jest.fn(x => x)
    out$.subscribeTopic(
        "_NAVIGATE",
        {
            next: spy,
            error: e => {
                console.warn("error in registers/registerRouterDOM:", e)
                return false
            },
        },
        { id: "testing registerRouterDOM" }
    )

    //const missing_props = warned()

    test("1: 'popstate' events trigger `_NAVIGATE` Command (routing).", async () => {
        fireEvent(window, createEvent("popstate", window))
        const result = spy.mock.results[0].value
        const sub$ = result[CMD_SUB$]
        const url = result[CMD_ARGS][URL_FULL]

        // wait for task to complete
        await new Promise(r => setImmediate(r))
        expect(warned).toHaveBeenCalledTimes(1)

        expect(spy.mock.calls.length).toBe(1)
        expect({ [CMD_SUB$]: sub$, [URL_FULL]: url }).toMatchObject({
            [CMD_SUB$]: "_NAVIGATE",
            [URL_FULL]: "http://localhost/",
        })
    })

    test("2: 'DOMContentLoaded' events trigger `_NAVIGATE` Command (routing)", async () => {
        fireEvent(window, createEvent("DOMContentLoaded", window))
        const result = spy.mock.results[1].value
        const sub$ = result[CMD_SUB$]
        const url = result[CMD_ARGS][URL_FULL]

        // wait for task to complete
        await new Promise(r => setImmediate(r))
        expect(warned).toHaveBeenCalledTimes(2)

        expect(spy.mock.calls.length).toBe(2)
        expect({ [CMD_SUB$]: sub$, [URL_FULL]: url }).toMatchObject({
            [CMD_SUB$]: "_NAVIGATE",
            [URL_FULL]: "http://localhost/",
        })
    })
})
