import { stream } from "@thi.ng/rstream"
import { Atom } from "@thi.ng/atom"
import { out$ } from "@-0/spool"
import { createSetStateCMD, SET_STATE } from "../../src/commands"
import { $store$ } from "../../src/store"
import { CMD_ARGS, STATE_DATA, STATE_PATH } from "@-0/keys"

const warned = jest.spyOn(console, "warn").mockImplementation()

describe("setstate + at root causes detour of non-Object", () => {
    test("1: `createSetStateCMD` state/store input is used as state container", () => {
        const store = new Atom({ hello: null })
        const CUSTOM_STATE_SETTING_COMMAND = createSetStateCMD(store, "_SET_TEST_STATE")
        // before
        expect(store.deref()).toMatchObject({ hello: null })
        out$.next({
            ...CUSTOM_STATE_SETTING_COMMAND,
            [CMD_ARGS]: { [STATE_PATH]: ["hello"], [STATE_DATA]: "yay! 👏" },
        })
        // after
        expect(store.deref()).toMatchObject({ hello: "yay! 👏" })
    })
    test("2: `SET_STATE` Command: applies submitted state changes to global `$store$`", async () => {
        // before
        expect($store$.deref()).toMatchObject({})

        out$.next({ ...SET_STATE, [CMD_ARGS]: { [STATE_PATH]: [], [STATE_DATA]: "hello" } })
        // after
        expect(warned.mock.calls.length).toBe(1)
        expect($store$.deref()["home"]).toBe("hello")
    })
})
