import { expect } from "@flowtr/test";
import { str, sequenceOf, letters, digits, choice } from "../parsers";

export default [
    {
        name: "string parser",
        fn: async () => {
            const parser = str("hello there");
            await expect(parser.run("parserthatfails")).toThrow();
        }
    },
    {
        name: "sequenceOf",
        fn: async () => {
            const parser = sequenceOf([str("hello"), str("goodbye")]);
            await expect(parser.run("hellogoodbye").result[0]).toEqual("hello");
            await expect(parser.run("hellogoodbye").result[1]).toEqual(
                "goodbye"
            );
        }
    },
    {
        name: "letters",
        fn: async () => {
            const parser = letters;

            expect(parser.run("goodbye").isError).toEqual(false);
            expect(parser.run("1234").isError).toEqual(true);
        }
    },
    {
        name: "digits",
        fn: async () => {
            const parser = digits;

            expect(parser.run("goodbye").isError).toEqual(true);
            expect(parser.run("1234").isError).toEqual(false);
        }
    },
    {
        name: "choice",
        fn: async () => {
            const parser = choice([letters, digits]);
            expect(parser.run("test1234").isError).toEqual(false);
            expect(parser.run("1234test").isError).toEqual(false);
        }
    }
];
