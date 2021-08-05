import { Parser, updateError, updateState, updateResult } from "./parser";

export const str = (s: string): Parser<string> =>
    new Parser((state) => {
        const { input, index, isError } = state;

        if (isError) return state;

        const slicedTarget = input.slice(index);

        if (slicedTarget.length === 0)
            return updateError(
                state,
                `str: Tried to match ${s}, but got unexpected end of input`
            );

        if (slicedTarget.startsWith(s))
            return updateState(state, index + s.length, s);

        return updateError(
            state,
            `str: Tried to match ${s}, but got ${input.slice(
                index,
                index + 25
            )}`
        );
    });

export const sequenceOf = (parsers: Parser<string>[]) =>
    new Parser<string, unknown[]>((state) => {
        const results: unknown[] = [];

        let nextState = state;

        for (const p of parsers) {
            nextState = p.transformer(nextState);
            results.push(nextState.result);
        }
        return updateResult(nextState, results);
    });

export const choice = (parsers: Parser<string>[]) =>
    new Parser<string>((state) => {
        if (state.isError) return state;
        let nextState = state;
        for (const p of parsers) {
            nextState = p.transformer(state);
            if (!nextState.isError) return nextState;
        }
        return updateError(
            nextState,
            `cohice: Unable to match with any parser at index ${state.index}`
        );
    });

export const regex = (exp: RegExp, name = "regex"): Parser<string> =>
    new Parser((state) => {
        const { input, index, isError } = state;

        if (isError) return state;

        const slicedTarget = input.slice(index);

        if (slicedTarget.length === 0)
            return updateError(state, `${name}: Got unexpected end of input`);

        const regexMatch = slicedTarget.match(exp);
        if (regexMatch)
            return updateState(
                state,
                index + regexMatch[0].length,
                regexMatch[0]
            );

        return updateError(
            state,
            `${name}: Couldn't match letters at index ${index}`
        );
    });
const lettersRegex = /^[A-Za-z]+/;
const digitsRegex = /^[0-9]+/;

export const letters = regex(lettersRegex);
export const digits = regex(digitsRegex);
