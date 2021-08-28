import { Atom } from "@thi.ng/atom";
import { isPlainObject, isArray } from "@thi.ng/checks";
import * as API from "@-0/keys";
export const $store$ = new Atom({
    [API.$$_LOAD]: true,
    [API.$$_PATH]: [],
    [API.$$_VIEW]: null,
});
const prep_key = "console";
const home_spread_err = `
You've attempted to swap a non-Object value into store 
at the root path. This would overwrite any other values 
in the store (which is an object). So, we've taken the 
liberty of preserving both by placing your value under 
a '${prep_key}' key at the root. 

Consider packaging this payload as an Object to enable 
it to be merged with the root Object and prevent this 
annoyance in the future.
`;
export const set$$tate = (path = [], val = {}, store = $store$) => {
    return store.swapIn(path, x => {
        const both_objects = isPlainObject(x) && isPlainObject(val);
        const array_to_object = isPlainObject(x) && isArray(val);
        if (both_objects)
            return Object.assign(Object.assign({}, x), val);
        if (array_to_object && !path.length) {
            console.warn(home_spread_err);
            return Object.assign(Object.assign({}, x), { [prep_key]: val });
        }
        return val;
    });
};
