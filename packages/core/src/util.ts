export const times = (n: number) => (f: (i: number) => void) => {
    const iter = (i: number) => {
        if (i === n) return;
        f(i);
        iter(i + 1);
    };
    return iter(0);
};

export const sum = (numArr: number[]) => numArr.reduce((x, y) => x + y, 0);
