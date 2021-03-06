/**
 * @module core/stream$
 */

import { fromDOMEvent, merge, ISubscribable } from "@thi.ng/rstream"
import { map } from "@thi.ng/transducers"

import { URL_FULL, DOM_NODE } from "@-0/keys"
// @ts-ignore
export const popstate$: ISubscribable<any> = fromDOMEvent(window, "popstate")
// @ts-ignore
export const DOMContentLoaded$: ISubscribable<any> = fromDOMEvent(window, "DOMContentLoaded")

/**
 *
 * There are three types of navigation we need to handle:
 * 1. DOMContentLoaded (entering the site) events
 * 2. popstate (browser back/forward button clicks) events
 * 3. `<a hurl="x">` (link clicking)
 *
 * These events have different payloads and need to be
 * harmonized in order to use them consistently
 *
 * ## getting the `hurl` property from the various events:
 * 1. ev.target.location.hurl
 * 2. ev.target.location.hurl
 * 3. ev.target.hurl
 *
 * for raw events, we can just transform them, but for link
 * clicking we need to convert/wrap it to align with the
 * destructuring of the others
 *
 * see _HURL in `/commands/routing.js` for ad-hoc stream
 * injection example
 */
export const DOMnavigated$ = merge({
    src: [ popstate$, DOMContentLoaded$ ]
}).transform({
    xform: map((x: Event | any) => {
        if (x.target.location.href && x.currentTarget) {
            return {
                [URL_FULL]: x.target.location.href,
                [DOM_NODE]: x.currentTarget
            }
        }
        console.log(
            "DOMnavigated$ triggered, but missing `x.target.location.href &/ x.currentTarget`",
            JSON.stringify(x, null, 2)
        )
        return x
    }),
    error: e => {
        console.warn("error in DOMnavigated$:", e)
        return true
    }
})
