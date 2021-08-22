import { NDArrayN } from ".";
import { Direction } from "./direction";
import { chunk, NDArray, TypedArray, TypedArrayFrom } from "./util";

export type Scalar = [];
export type Vector<T extends number = 3> = [T];
export type Matrix3<T extends number = 3> = [T, T];
export type Matrix4<T extends number = 4> = [T, T];

export const isVector = <T extends TypedArray, S extends [number] = [3]>(
    v: Tensor<number[], T>,
    size: S
): v is Tensor<Vector, T> => isOfSize(v, size);

export const isOfSize = <T extends TypedArray, S extends number[] = [3]>(
    tensor: Tensor,
    size: S
): tensor is Tensor<S, T> =>
    size.length === tensor.dimensions().length &&
    size.every((d, i) => tensor.dimensions()[i] === d);

export class Tensor<
    S extends number[] = number[],
    T extends TypedArray = TypedArray
> {
    protected size: S;
    protected data: T;

    constructor({
        data,
        size,
        type = Float64Array // never was the quick fix, seems like a good idea
    }: {
        data: NDArray;
        size?: S;
        type?: TypedArrayFrom;
    }) {
        let s = size as number[];
        if (!s) {
            s = [];
            let dim: NDArrayN = data;
            while (Array.isArray(dim)) {
                s.push(dim.length);
                dim = dim[0];
            }
        }
        this.data = type.from(data.flat(Infinity)) as T;
        if (this.data.length !== s.reduce((s, l) => s * l, 1))
            throw TypeError("Incorrect element count");
        this.size = s as S;
    }
    static get zero() {
        return Tensor.zeros([]);
    }
    static get vectorZero() {
        return Tensor.zeros([3]);
    }
    static get vectorZero4() {
        return Tensor.zeros([3]);
    }
    static get matrixZero3() {
        return Tensor.zeros([3, 3]);
    }
    static get matrixZero4() {
        return Tensor.zeros([4, 4]);
    }
    static random<S extends number[]>(size: S, multiplier = 1) {
        const result = Tensor.zeros(size);
        result.map(() => Math.floor(Math.random() * multiplier));
        return result;
    }
    /**
     * @description Initializes an empty tensor with the specified size. All values in the data array will be 0.
     */
    static zeros<S extends number[]>(size: S) {
        return new Tensor({
            data: new Array(size.reduce((s, l) => s * l, 1)).fill(0),
            size
        });
    }
    get x() {
        return this.data[0];
    }
    set x(value) {
        this.data[0] = value;
    }
    get y() {
        return this.data[1];
    }
    set y(value) {
        this.data[1] = value;
    }
    get z() {
        return this.data[2];
    }
    set z(value) {
        this.data[2] = value;
    }
    get w() {
        return this.data[3];
    }
    set w(value) {
        this.data[3] = value;
    }
    sum() {
        let s = 0;
        this.forEach((v) => (s += v));
        return s;
    }
    set(...n: number[]) {
        this.data.set(n);
        return this;
    }

    static from<T extends number[] = number[]>(...data: number[]) {
        return new Tensor<T>({ data });
    }

    static fromString(s: string) {
        return new Tensor({ data: s.split(",").map((sv) => parseFloat(sv)) });
    }

    static fromDirection(d: Direction) {
        switch (d) {
            case Direction.North:
                return Tensor.from(0, 0, 1);
            case Direction.South:
                return Tensor.from(0, 0, -1);
            case Direction.East:
                return Tensor.from(1, 0, 0);
            case Direction.West:
                return Tensor.from(-1, 0, 0);
            case Direction.Up:
                return Tensor.from(0, 1, 0);
            case Direction.Down:
                return Tensor.from(0, -1, 0);
            default:
                return Tensor.from(0, 0, 0);
        }
    }

    toString() {
        return this.data.toString();
    }
    /**
     * @description Swaps the dimensions of this tensor
     */
    transpose() {
        this.size.reverse();
        return this;
    }
    /**
     * @description converts
     */
    toArray() {
        const size = this.size;
        const go = (a: number[] | number[][]) => {
            const s = size.pop();
            if (!s) return a;
            const result = chunk(a as number[][], s);
            size.push(s);
            return result.length > 1 ? result.map(go) : a;
        };
        return go(Array.from(this.data));
    }

    toTypedArray() {
        return this.data;
    }

    /**
     * @description Offsets this tensor by the specified amount.
     * If n is not specified then it will default to one unit.
     * Keep in mind that this method does not clone the current Tensor.
     * Also, the size must match the value array's length.
     * @param n The amount of units to offset to
     * @param val The offset values (ex. offset(1, 0, 2, 0) will offset 2 units up)
     */
    offset(n = 1, val: number[]) {
        // TODO: size check on val and this.size
        if (this.size[0] != val.length)
            throw new Error(
                "This tensor's size must be the same as the offset value array!"
            );
        this.map((v, i) => v + val[i] * n);
        return this;
    }
    /**
     * @description Offsets this Tensor in the specified direction (n times).
     * If n is not specified then it will default to one unit in the direction specified.
     * Keep in mind that this method does not clone the current Tensor.
     * @param direction the direction to offset in
     */
    offsetDir(n = 1, direction: Direction) {
        if (!isOfSize(this, [3]))
            throw TypeError(
                "This tensor must be a Vector of size [3] to be offsetted."
            );
        const dirVec = Tensor.fromDirection(direction);
        dirVec.scale(n);
        this.add(dirVec);
        return this;
    }

    dimensions() {
        return this.size;
    }
    /**
     * @description
     * Copies the current Tensor and returns the new copy.
     * This is used if you don't want to modify the original Tensor when using operations.
     */
    clone() {
        const d: number[] = [];
        this.data.forEach((n: number) => d.push(n));
        const m = new Tensor({ data: d, size: this.size });
        return m;
    }
    add(n: number | Tensor) {
        if (typeof n === "number") {
            this.mapSet((v) => v + n);
            return this;
        }
        if (this.size.some((v, i) => n.size[i] !== v))
            throw TypeError("Tensor have to have the same size");
        this.mapSet((v, i) => v + n.data[i]);
        return this;
    }
    sub(n: number | Tensor) {
        if (typeof n === "number") {
            this.mapSet((v) => v - n);
            return this;
        }
        if (!isOfSize(n, this.size))
            throw TypeError("Tensor have to have the same size");
        this.mapSet((v, i) => v - n.data[i]);
        return this;
    }
    /**
     * @returns the dot product of the tensors
     */
    dot(m: Tensor) {
        return this.mag() * m.mag();
    }
    /**
     * Apply function to all elements in this Tensor.
     *
     * @param callback With signature (number, row, col) => number
     */
    map(callback: (v: number, i: number, j: TypedArray) => number) {
        return this.data.map(callback) as T;
    }

    mapSet(callback: (v: number, i: number, j: TypedArray) => number) {
        this.data = this.data.map(callback) as T;
        return this;
    }

    every(callback: (v: number, i: number, j: TypedArray) => boolean) {
        return this.data.every(callback);
    }

    some(callback: (v: number, i: number, j: TypedArray) => boolean) {
        return this.data.some(callback);
    }

    /**
     * Iterate over all the elements in this tensor.
     *
     * @param callback With signature (value, index, array) => void
     */
    forEach(callback: (v: number, i: number, j: TypedArray) => void) {
        this.data.forEach(callback);
        return this;
    }
    scale(factor: number) {
        this.mapSet((v) => v * factor);
        return this;
    }
    divide(n: number) {
        return this.scale(1 / n);
    }
    // TODO: matrix multiplcation (.mult()) and division (.div())
    negate() {
        return this.mapSet((v) => -v);
    }
    lerp(a: Tensor, b: Tensor, fraction: number) {
        return b.clone().sub(a).scale(fraction).add(a);
    }
    /**
     * Get the length of the vector.
     * @returns {number} the length.
     */
    mag() {
        return this.reduce((a: number, b: number) => Math.hypot(a, b), 0);
    }

    reduce<R = number, T extends unknown[] = [number, number]>(
        callback: (...args: T) => R,
        initialValue: unknown
    ): R {
        const myReduce = (
            list: unknown[],
            initialValue: unknown,
            reducer: {
                (...args: unknown[]): R;
            }
        ) => {
            if (list.length === 0) return initialValue;
            else {
                const [first, ...rest] = list;
                const updatedAcc = reducer(initialValue, first);
                return myReduce(rest, updatedAcc, reducer);
            }
        };

        return myReduce(
            Array.from(this.data),
            initialValue,
            callback as unknown as (...args: unknown[]) => R
        );
    }

    /**
     * Returns the distance from another tensor
     * @function
     * @param vector - Other tensor
     * @returns Distance between the two tensors
     * @instance
     * @name distance
     */
    distance(vector: Tensor) {
        return vector.clone().sub(this).mag();
    }
    [Symbol.toPrimitive](hint: string) {
        if (!isOfSize(this, []))
            throw new Error(
                "This tensor must be a scalar to be converted to a primitive."
            );
        if (hint === "string") return this.toString();
        return this.x;
    }
    /**
     * Get the normalized version of a vector
     * @param v the vector to be normalized
     * @returns the normalized vector.
     */
    normalize() {
        return this.scale(1 / this.mag());
    }
    /**
     * Set the length of this vector
     * @param n new length.
     */
    setMag(n: number) {
        return this.normalize().scale(n);
    }

    equals(m: Tensor | number[] | number) {
        if (m instanceof Tensor) return this.every((v, i) => v === m.data[i]);
        else if (Array.isArray(m)) return this.every((v, i) => v === m[i]);
        else return this.every((v) => v === m);
    }
}
