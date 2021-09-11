import * as API from "@-0/keys";
export declare const LOG_PROP: (PROP: string) => Partial<{
    work: (args: any) => any;
    src$: import("@thi.ng/rstream").ISubscriber<any> | import("@thi.ng/rstream").ISubscribable<any>;
    args: any;
    sub$: string;
    reso: (acc: API.Accumulator, res: any) => any;
    erro: (acc: API.Accumulator, err: Error, out$: import("@thi.ng/rstream").PubSub<unknown, unknown, any>) => any;
}> | Partial<{
    args: any;
    sub$: string;
    reso: (acc: API.Accumulator, res: any) => any;
    erro: (acc: API.Accumulator, err: Error, out$: import("@thi.ng/rstream").PubSub<unknown, unknown, any>) => any;
}>;
