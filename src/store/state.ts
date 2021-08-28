/**
 * @module store/state
 */

import { Atom } from "@thi.ng/atom"
import { isPlainObject, isArray } from "@thi.ng/checks"
import * as API from "@-0/keys"

// Global $store$ Container from [@thi.ng/atom](http://thi.ng/atom)
//export const $store$ = new Atom(API.$$_DEFAULT)
export const $store$ = new Atom({
    [API.$$_LOAD]: true,
    [API.$$_PATH]: [],
    [API.$$_VIEW]: null,
})

const prep_key = "console"

const home_spread_err = `
You've attempted to swap a non-Object value into store 
at the root path. This would overwrite any other values 
in the store (which is an object). So, we've taken the 
liberty of preserving both by placing your value under 
a '${prep_key}' key at the root. 

Consider packaging this payload as an Object to enable 
it to be merged with the root Object and prevent this 
annoyance in the future.
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
        const array_to_object = isPlainObject(x) && isArray(val)
        if (both_objects) return { ...x, ...val }
        if (array_to_object && !path.length) {
            console.warn(home_spread_err)
            return { ...x, [prep_key]: val }
        }
        return val
    })
}
