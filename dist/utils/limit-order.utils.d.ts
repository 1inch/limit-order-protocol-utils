export declare function trim0x(hexString: string): string;
export declare function getOffsets(data: string[], subtrahend?: number): string;
export declare function joinStaticCalls(data: string[]): {
    offsets: string;
    data: string;
};
export declare function parseSimulateResult(result: string): {
    success: boolean;
    result: string;
} | null;
export declare function getMakingAmountForRFQ(amount: string): string;
