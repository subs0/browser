/**
 * @module store/state
 */

import { Atom } from "@thi.ng/atom"
import { isPlainObject, isArray } from "@thi.ng/checks"
import * as API from "@-0/keys"

// Global $store$ Container from [@thi.ng/atom](http://thi.ng/atom)
export const $store$ = new Atom(API.$$_DEFAULT)
//export const $store$ = new Atom({
//    [API.$$_LOAD]: true,
//    [API.$$_PATH]: [],
//    [API.$$_VIEW]: null,
//})

const DETOUR_KEY = "home"

const home_spread_err = `
You've attempted to swap a non-Object payload into store 
at the root path. This would overwrite any other values 
in the store (which is an object). So, we've taken the 
liberty of preserving both by placing your payload under 
a '${DETOUR_KEY}' key at the root. 

If you need to place something at the root of the state, 
please consider packaging this payload as an Object to 
enable it to be merged with the root Object and prevent 
this annoyance in the future.
`
/**
 *
 * Swaps the current value at the given path/lens into the
 * global store with that of the given value. Checks to see
 * if that value should be either spread into an existing
 * object or a complete replacement.
 *
 * If the path is empty (e.g., [] = home page),
 */
export const set$$tate = (path: string[] = [], val = {}, store = $store$) => {
    // @ts-ignore
    return store.swapIn(path, x => {
        // if both swap and target are objects, merge
        // else just reset to val at path (i.e., careful!)
        const both_objects = isPlainObject(x) && isPlainObject(val)
        if (both_objects) return { ...x, ...val }
        if (!isPlainObject(val) && !path.length) {
            console.warn(home_spread_err)
            return { ...x, [DETOUR_KEY]: val }
        }
        return val
    })
}
