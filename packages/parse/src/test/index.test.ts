import { expect } from "@flowtr/test";

export default [
    {
        name: "example",
        fn: async () => {
            await expect("hello world!").toEqual("hello world!");
        }
    }
];
