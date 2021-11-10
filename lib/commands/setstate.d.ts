import { Command, ICommandObject } from "@-0/keys";
export declare const createSetStateCMD: (store?: import("@thi.ng/atom").Atom<{
    router: {
        $$_PATH: any[];
        $$_LOAD: boolean;
        $$_VIEW: any;
    };
}>, sub$?: string) => ICommandObject;
export declare const SET_STATE: Command;
