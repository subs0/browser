import { ISubscribable } from "@thi.ng/rstream";
export declare const popstate$: ISubscribable<PopStateEvent>;
export declare const DOMContentLoaded$: ISubscribable<Event>;
export declare type NavigationObject = Partial<{
    target: {
        location: {
            href: string;
        };
    };
    currentTarget: HTMLElement | Document;
    state: Record<string, unknown>;
}>;
export declare const DOMnavigated$: import("@thi.ng/rstream").ISubscription<unknown, Partial<{
    target: {
        location: {
            href: string;
        };
    };
    currentTarget: HTMLElement | Document;
    state: Record<string, unknown>;
}> | {
    _FURL: string;
    _NODE: HTMLElement | Document;
    PUSH_STATE: Record<string, unknown>;
}>;
