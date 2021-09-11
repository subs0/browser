import { fromDOMEvent, merge } from "@thi.ng/rstream";
import { map } from "@thi.ng/transducers";
import { URL_FULL, DOM_NODE, POP_STATE } from "@-0/keys";
export const popstate$ = fromDOMEvent(window, "popstate");
export const DOMContentLoaded$ = fromDOMEvent(window, "DOMContentLoaded");
export const DOMnavigated$ = merge({
    src: [popstate$, DOMContentLoaded$],
}).transform({
    xform: map((e) => {
        const payload = {
            [URL_FULL]: e.target.location.href,
            [DOM_NODE]: e.currentTarget,
            [POP_STATE]: e.state || null,
        };
        console.log("DOMnavigated$ event:", payload);
        if (e.target.location.href && e.currentTarget) {
            return payload;
        }
        console.log("DOMnavigated$ triggered, but missing `x.target.location.href &/ x.currentTarget`", JSON.stringify(e, null, 2));
        return e;
    }),
    error: err => {
        console.warn("DOMnavigated$ ERROR:", err);
        return true;
    },
});
