import { colors, createColoredLogger, ILogger } from "@flowtr/logger";
import equal from "fast-deep-equal/es6/index.js";

export class TestRunner {
    async onError(test: Test, err: unknown) {
        console.error(
            `\n${colors.fg.red}FAIL ${colors.fg.white}> ${test.name}${colors.reset}\n`
        );
        console.error(`${colors.fg.red}${(err as Error).stack}${colors.reset}`);
    }

    async handle(test: Test, file?: string) {
        try {
            const ctx = await test.fn({
                file,
                name: test.name
            });
            if (ctx && ctx.disabled)
                console.info(
                    `\nDISABLED ${colors.fg.white}> ${test.name}${colors.reset}`
                );
            else
                console.info(
                    `\n${colors.fg.green}OK ${colors.fg.white}> ${test.name}`
                );
        } catch (err) {
            await this.onError(test, err);
        }
    }
}

export class Expect<T = unknown> {
    constructor(
        public readonly value: T,
        public readonly logger: ILogger = createColoredLogger(console)
    ) {}

    async toEqual(expected: unknown) {
        if (!equal(expected, this.value))
            throw new Error(`Expected: ${expected}\nRecieved: ${this.value}`);
    }

    async toNotThrow(expected?: unknown, ...args: unknown[]) {
        const fn = this.value as unknown as
            | ((...a: unknown[]) => Promise<unknown>)
            | ((...a: unknown[]) => unknown);
        try {
            await fn(...args);
        } catch (err) {
            if (expected && !equal(err, expected))
                throw new Error(
                    `Expected function to not throw ${expected || "err"}`
                );
        }
    }

    async toThrow(expected?: unknown, ...args: unknown[]) {
        const fn = this.value as unknown as
            | ((...a: unknown[]) => Promise<unknown>)
            | ((...a: unknown[]) => unknown);
        try {
            await fn(...args);
            throw new Error(
                `Expected function to throw ${expected || "error"}`
            );
        } catch (err) {
            if (expected && err instanceof Error) {
                if (
                    expected instanceof Error &&
                    err.message !== expected.message
                )
                    throw new Error(
                        `Expected function to throw ${
                            expected || "err"
                        }, received ${(err as Error).message} instead`
                    );
                else if (
                    typeof expected === "string" &&
                    err.message !== expected
                )
                    throw new Error(
                        `Expected function to throw ${
                            expected || "err"
                        }, received ${(err as Error).message} instead`
                    );
            } else if (expected && !equal(err, expected))
                throw new Error(
                    `Expected function to throw ${
                        expected || "err"
                    }, received ${(err as Error).message} instead`
                );
        }
    }
}

export const expect = (value: unknown) => new Expect(value);

export type TestContext = { file?: string; name: string; disabled?: boolean };
export type Test = {
    name: string;
    fn: (ctx: TestContext) => Promise<TestContext | undefined>;
};
