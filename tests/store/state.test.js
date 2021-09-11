import { Atom } from "@thi.ng/atom"
import { $store$, set$$tate } from "../../src/store"
import { _, CMD_ARGS, STATE_DATA, STATE_PATH, $$_LOAD, $$_PATH, $$_VIEW, $$_ROOT } from "@-0/keys"

describe("state", () => {
    test(`1: $store$: Default $store$.deref() configuration`, () => {
        expect({
            //[$$_CMDS] : {},
            [$$_LOAD]: true,
            [$$_PATH]: [],
            //[$$_ROOT]: null,
            [$$_VIEW]: null,
        }).toMatchObject($store$.deref()[_])
    })
    test(`2: $store$: setting $store$ via .resetIn`, () => {
        // before
        expect($store$.deref()[_][$$_LOAD]).toBe(true)
        $store$.resetIn([_, $$_LOAD], false)
        // after
        expect($store$.deref()[_][$$_LOAD]).toBe(false)
    })
    test(`3: set$$tate: path = [] (empty -> root), data = Primitive`, () => {
        expect($store$.deref()[_][$$_VIEW]).toBe(null)
        // before
        const view_component = x => `<a href=${x}>${x}</a>`
        set$$tate([_, $$_VIEW], view_component)
        // after
        expect($store$.deref()[_][$$_VIEW]).toBeInstanceOf(Function)
    })
})
