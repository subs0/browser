import { Atom } from "@thi.ng/atom";
import { isPlainObject, isArray } from "@thi.ng/checks";
import { $$_DEFAULT } from "@-0/keys";
export const $store$ = new Atom($$_DEFAULT);
const prep_key = "see-console";
const home_spread_err = `
You've attempted to swap Array values into store at 
the root path. This would overwrite any other values 
in the store (which is an object). So, we've taken 
the liberty of preserving both by placing this Array 
under a '${prep_key}' key at the root. 

Consider packaging this payload as an Object to 
prevent this annoyance.
`;
export const set$$tate = (path = [], val = {}, store = $store$) => {
    return store.swapIn(path, x => {
        const both_objects = isPlainObject(x) && isPlainObject(val);
        const array_to_object = isPlainObject(x) && isArray(val);
        if (both_objects)
            return Object.assign(Object.assign({}, x), val);
        if (array_to_object && !path.length) {
            console.log(home_spread_err);
            return Object.assign(Object.assign({}, x), { [prep_key]: val });
        }
        return val;
    });
};
