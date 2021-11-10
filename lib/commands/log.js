import * as API from "@-0/keys";
import { registerCMD } from "@-0/spool";
export const LOG_PROP = (PROP) => registerCMD({
    [API.CMD_SUB$]: "_LOG_PROP_" + PROP,
    [API.CMD_ARGS]: ({ [PROP]: target }) => ({ [PROP]: target }),
    [API.CMD_WORK]: ({ [PROP]: target }) => console.log("Logging for " + PROP, JSON.stringify(target, null, 2)),
});
