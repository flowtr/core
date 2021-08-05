import { expect } from "../src";

const fn1 = async () => {
    throw new Error("oof async");
};

const fn2 = () => {
    throw new Error("oof");
};

export default [
    {
        name: "async throw",
        fn: async () => {
            await expect(fn1).toThrow(new Error("oof async"));
        }
    },
    {
        name: "throw",
        fn: async () => {
            await expect(fn2).toThrow(new Error("oof"));
        }
    }
];
