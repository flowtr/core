import { Direction, Tensor } from "..";
import "jest-extended";

describe("Tensor", () => {
    it("should create a tensor", async () => {
        const t = new Tensor({
            data: [1, 2, 3],
            size: [3]
        });
        expect(t.toArray()).toContainAllValues([1, 2, 3]);
    });

    it("should create a tensor using Tensor.from", async () => {
        const t = Tensor.from(1, 2, 3);
        expect(t.toArray()).toContainAllValues([1, 2, 3]);
    });

    it("Should add tensors", async () => {
        const t1 = new Tensor({
            data: [1, 2, 3],
            size: [3]
        });
        const t2 = new Tensor({
            data: [4, 5, 6],
            size: [3]
        });
        const t3 = t1.clone().add(t2);
        expect(t3.toArray()).toContainAllValues([5, 7, 9]);
    });

    it("Should add tensors with a scalar", async () => {
        const t1 = new Tensor({
            data: [1, 2, 3],
            size: [3]
        });

        const t3 = t1.clone().add(4);
        expect(t3.toArray()).toContainAllValues([5, 6, 7]);
    });

    it("should parse a tensor using Tensor.fromString", async () => {
        const t = Tensor.fromString("1,2,3");
        expect(t.toArray()).toContainAllValues([1, 2, 3]);
    });

    it("should parse a tensor using Tensor.fromDirection", async () => {
        const t = Tensor.fromDirection(Direction.North);
        expect(t.toArray()).toContainAllValues([0, 0, 1]);
    });

    it("should create dot product of two tensors", async () => {
        const t1 = new Tensor({
            data: [1, 2, 3],
            size: [3]
        });
        const t2 = new Tensor({
            data: [4, 5, 6],
            size: [3]
        });
        const dotProductScalar = t1.clone().dot(t2);
        expect(Math.floor(dotProductScalar)).toBe(32);
    });

    it("should get distance of two tensors", async () => {
        const t1 = new Tensor({
            data: [1, 2, 3],
            size: [3]
        });
        const t2 = new Tensor({
            data: [4, 5, 6],
            size: [3]
        });
        const distance = t1.clone().distance(t2);
        expect(Math.floor(distance)).toBe(5);
    });

    it("toArray should return a n dimensional array of tensor data", async () => {
        const t = new Tensor({
            data: [1, 2, 3, 4, 5, 6],
            size: [2, 3]
        });
        expect(t.toArray()).toStrictEqual([
            [1, 2, 3],
            [4, 5, 6]
        ]);
    });

    it("tensors should be offset", async () => {
        const t = new Tensor({
            data: [1, 2, 3]
        });
        const offset = t.clone().offsetDir(1, Direction.North);
        expect(offset.toArray()).toStrictEqual([1, 2, 4]);
    });
});
