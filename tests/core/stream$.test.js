import { createEvent, fireEvent } from "@testing-library/dom"
import { URL_FULL, DOM_NODE, PUSH_STATE } from "@-0/keys"
import { DOMContentLoaded$, DOMnavigated$, popstate$ } from "../../src/core"
import { map } from "@thi.ng/transducers"

describe("stream$", () => {
    test("popstate$ and DOMnavigated$ emissions when popState event fired on window Object", () => {
        const spy_pop = jest.fn(x => x)
        const spy_nav = jest.fn(x => x)
        popstate$.subscribe({ next: spy_pop, error: e => false })
        DOMnavigated$.subscribe({ next: spy_nav, error: e => false })
        fireEvent(
            window,
            createEvent(
                "popstate",
                window,
                {
                    bubbles: true,
                    cancelable: true,
                },
                { EventType: "CustomEvent" }
            )
        )
        expect(spy_pop).toHaveBeenCalledTimes(1)
        expect(spy_nav).toHaveBeenCalledTimes(1)
        //Object.entries(spy_nav.mock.results[0].value).forEach(([ k, v ]) => console.log({ k, v }))
        expect(Object.keys(spy_nav.mock.results[0].value)).toMatchObject([URL_FULL, DOM_NODE, PUSH_STATE])
    })
    test("DOMContentLoaded emission when fired on window Object", () => {
        const spy = jest.fn(x => x)
        DOMContentLoaded$.subscribe({ next: spy, error: e => false })
        window.dispatchEvent(
            new Event("DOMContentLoaded", {
                bubbles: true,
                cancelable: true,
            })
        )
        expect(spy).toHaveBeenCalledTimes(1)
    })
})
