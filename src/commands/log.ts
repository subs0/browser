import * as API from "@-0/keys"
import { registerCMD } from "@-0/spool"

/**
 * Just a little logging Commmand that can be injected into
 * a Task to inspect a certain prop within the Accumulator
 *
 * @example
 *
 * const LOG_PUSH_STATE = LOG_PROP("PUSH_STATE")
 *
 * run$.next([ _HREF_PUSHSTATE_DOM, LOG_PUSH_STATE])
 */
export const LOG_PROP = (PROP: string) =>
    registerCMD({
        [API.CMD_SUB$]: "_LOG_PROP_" + PROP,
        // @ts-ignore
        [API.CMD_ARGS]: ({ [PROP]: target }) => ({ [PROP]: target }),
        [API.CMD_WORK]: ({ [PROP]: target }) => console.log("Logging for " + PROP, JSON.stringify(target, null, 2)),
    })
