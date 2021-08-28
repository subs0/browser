import { Atom } from "@thi.ng/atom";
import { isPlainObject } from "@thi.ng/checks";
import * as API from "@-0/keys";
export const $store$ = new Atom(API.$$_DEFAULT);
const DETOUR_KEY = "home";
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
`;
export const set$$tate = (path = [], val = {}, store = $store$) => {
    return store.swapIn(path, x => {
        const both_objects = isPlainObject(x) && isPlainObject(val);
        if (both_objects)
            return Object.assign(Object.assign({}, x), val);
        if (!isPlainObject(val) && !path.length) {
            console.warn(home_spread_err);
            return Object.assign(Object.assign({}, x), { [DETOUR_KEY]: val });
        }
        return val;
    });
};
