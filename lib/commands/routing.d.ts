import { ICommand, Command } from "@-0/keys";
export declare const navEventHandler: (ev: any) => any;
export declare const cmd_nav: ICommand;
export declare const _SET_LINK_ATTRS_DOM: Command;
export declare const _PUSHSTATE_IF_HREF: Partial<{
    work: (args: any) => any;
    src$: import("@thi.ng/rstream").ISubscriber<any> | import("@thi.ng/rstream").ISubscribable<any>;
    args: any;
    sub$: string;
    reso: (acc: import("@-0/keys").Accumulator, res: any) => any;
    erro: (acc: import("@-0/keys").Accumulator, err: Error, out$: import("@thi.ng/rstream").PubSub<unknown, unknown, any>) => any;
}> | {
    sub$: string;
    args: any;
    reso: (acc: import("@-0/keys").Accumulator, res: any) => any;
    erro: (acc: import("@-0/keys").Accumulator, err: Error, out$: import("@thi.ng/rstream").PubSub<unknown, unknown, any>) => any;
} | {
    sub$: string;
    args: any;
    reso?: undefined;
    erro?: undefined;
};
export declare const _RESTORE_SCROLL_IF_POPSTATE: Partial<{
    work: (args: any) => any;
    src$: import("@thi.ng/rstream").ISubscriber<any> | import("@thi.ng/rstream").ISubscribable<any>;
    args: any;
    sub$: string;
    reso: (acc: import("@-0/keys").Accumulator, res: any) => any;
    erro: (acc: import("@-0/keys").Accumulator, err: Error, out$: import("@thi.ng/rstream").PubSub<unknown, unknown, any>) => any;
}> | {
    sub$: string;
    args: any;
    reso: (acc: import("@-0/keys").Accumulator, res: any) => any;
    erro: (acc: import("@-0/keys").Accumulator, err: Error, out$: import("@thi.ng/rstream").PubSub<unknown, unknown, any>) => any;
} | {
    sub$: string;
    args: any;
    reso?: undefined;
    erro?: undefined;
};
export declare const _NOTIFY_PRERENDER_DOM: Command;
