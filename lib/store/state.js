import { Atom } from "@thi.ng/atom";
import { isObject } from "@thi.ng/checks";
import * as API from "@-0/keys";
export const $store$ = new Atom(API.$$_DEFAULT);
const home_spread_err = `
You've attempted to set a non-Object payload to the store 
at the root path. This would overwrite any other values 
in the store (which is an object). So, we've taken the 
liberty of preserving both by placing your payload under 
the '${API.DETOUR}' key at the root. 

If you need to place something at the root of the store, 
please consider packaging this payload as an Object to 
enable it to be merged (using { ...store, ...yours }) with 
the root Object and prevent this annoyance in the future.
`;
export const set$$tate = (path = [], val = {}, store = $store$) => {
    return store.swapIn(path, x => {
        console.log({ x, val });
        const both_objects = isObject(x) && isObject(val);
        if (both_objects)
            return Object.assign(Object.assign({}, x), val);
        if (!isObject(val) && !path.length) {
            console.warn(home_spread_err);
            return Object.assign(Object.assign({}, x), { [API.DETOUR]: val });
        }
        return val;
    });
};
