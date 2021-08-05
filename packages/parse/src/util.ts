const bufferExists = (): boolean => typeof Buffer !== "undefined";

export const ensureBuffer = () => {
    if (!bufferExists())
        throw new Error(
            "Buffer global does not exist; please use webpack if you need to parse Buffers in the browser."
        );
};

export const isBuffer = (x: unknown /* global Buffer */) =>
    bufferExists() && Buffer.isBuffer(x);

export interface SuccessResult<T> {
    status: true;
    index: number;
    value: T;
    furthest: number;
    expected: string[];
}

export interface FailureResult {
    status: false;
    index: number;
    value: null;
    furthest: number;
    expected: string[];
}

export type Result<T = unknown> = FailureResult | SuccessResult<T>;

export const makeSuccess = <T = unknown>(index: number, value: T): Result => ({
    status: true,
    index: index,
    value: value,
    furthest: -1,
    expected: []
});

export const makeFailure = (
    index: number,
    expected: string[] | string
): Result => {
    let exp: string[];
    if (!Array.isArray(expected)) exp = [expected];
    else exp = expected;

    return {
        status: false,
        index: -1,
        value: null,
        furthest: index,
        expected: exp
    };
};

export const union = (xs: unknown[], ys: string | unknown[]) => {
    // for newer browsers/node we can improve performance by using
    // modern JS
    if (typeof Set !== undefined && Array.from) {
        // eslint-disable-next-line no-undef
        const set = new Set(xs);
        for (let y = 0; y < ys.length; y++) set.add(ys[y]);

        const arr = Array.from(set);
        arr.sort();
        return arr;
    } else
        throw new Error(
            "Your javascript version does not have Array.from or Set."
        );
};
