export const times = (n: number) => (f: (i: number) => void) => {
    const iter = (i: number) => {
        if (i === n) return;
        f(i);
        iter(i + 1);
    };
    return iter(0);
};

export const sum = (numArr: number[]) => numArr.reduce((x, y) => x + y, 0);

export const chunk = (a: number[] | number[][], b: number) =>
    Array.from({ length: Math.ceil(a.length / b) }, (_, r) =>
        a.slice(r * b, r * b + b)
    );

export type TypedArray =
    | Float32Array
    | Float64Array
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8ClampedArray
    | Uint8Array
    | Uint16Array
    | Uint32Array;
export type Constructor<T> = new (...args: unknown[]) => T;
export type NDArray = number | ArrayLike<number> | ArrayLike<NDArray>;
export type TypedArrayFrom<T extends TypedArray = TypedArray> = {
    from(array: ArrayLike<number>): T;
};

export const wait = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
