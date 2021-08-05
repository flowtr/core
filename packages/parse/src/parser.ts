export const updateState = <T = string>(
    state: State<T>,
    index: number,
    result: T | null
): State<T> => ({
    ...state,
    index,
    result
});

export const updateResult = <T = string, R = T>(
    state: State<T>,
    result: R | null
): State<R> => ({
    ...state,
    result
});

export const updateError = <T = string>(
    state: State<T>,
    error: string
): State<T> => ({
    ...state,
    isError: true,
    error
});

export interface State<T = string> {
    input: string;
    result: T | null;
    index: number;
    error: string | null;
    isError: boolean;
}

export type ParserFn<T = string, R = T> = (input: State<T>) => State<R>;

export class Parser<T = string, R = T> {
    constructor(public readonly transformer: ParserFn<T, R>) {}

    // TODO: buffer support for binary
    run(input: string) {
        const initialState: State<T> = {
            index: 0,
            result: null,
            input,
            isError: false,
            error: null
        };
        return this.transformer(initialState);
    }

    map<F = string>(fn: (result: R | null) => F) {
        new Parser<T, F | R>((state) => {
            const nextState = this.transformer(state);

            if (nextState.isError) return nextState;

            return updateResult(nextState, fn(nextState.result));
        });
    }

    errorMap<F = string>(fn: (error: string | null, index: number) => F) {
        new Parser<T, F | R>((state) => {
            const nextState = this.transformer(state);

            if (!nextState.isError) return nextState;

            return updateResult(
                nextState,
                fn(nextState.error, nextState.index)
            );
        });
    }
}
