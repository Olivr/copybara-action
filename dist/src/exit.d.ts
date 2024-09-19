export declare const exitCodes: {
    [k: number]: ExitCode;
};
type ExitCode = {
    type: "success" | "warning" | "error";
    ns: "copybara" | "action";
    msg: string;
};
export declare function exit(exitCode: number, message?: string): void;
export {};
//# sourceMappingURL=exit.d.ts.map