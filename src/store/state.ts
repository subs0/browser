/**
 * @module store/state
 */

import { Atom } from "@thi.ng/atom"
import { isPlainObject, isArray } from "@thi.ng/checks"
import { $$_DEFAULT, DefaultDraft } from "@-0/keys"

// Global $store$ Container from [@thi.ng/atom](http://thi.ng/atom)
export const $store$ = new Atom($$_DEFAULT)

const prep_key = "see-console"

const home_spread_err = `
You've attempted to swap Array values into store at 
the root path. This would overwrite any other values 
in the store (which is an object). So, we've taken 
the liberty of preserving both by placing this Array 
under a '${prep_key}' key at the root. 

Consider packaging this payload as an Object to 
prevent this annoyance.
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
            console.log(home_spread_err)
            return { ...x, [prep_key]: val }
        }
        return val
    })
}
