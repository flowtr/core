import { Direction } from "./direction";
import { Tensor, Vector } from "./tensor";

export class Cuboid {
    minimumPoint: Tensor<Vector>;
    maximumPoint: Tensor<Vector>;

    static EMPTY = new Cuboid(0, 0, 0, 0, 0, 0);
    static FULL_CUBE = new Cuboid(0, 0, 0, 1, 1, 1);

    constructor(
        x1: number,
        y1: number,
        z1: number,
        x2: number,
        y2: number,
        z2: number
    ) {
        this.minimumPoint = Tensor.from(x1, y1, z1);
        this.maximumPoint = Tensor.from(x2, y2, z2);
    }
    static fromVector(v: Tensor<Vector>) {
        return this.fromVectors(v, v);
    }
    /**
     *
     * @param p1 The minimum point
     * @param p2 The maximum point
     */
    static fromVectors(p1: Tensor<Vector>, p2: Tensor<Vector>) {
        return new Cuboid(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
    equals(c: { minimumPoint: Tensor<Vector>; maximumPoint: Tensor<Vector> }) {
        return (
            c.minimumPoint.equals(this.minimumPoint) &&
            c.maximumPoint.equals(this.maximumPoint)
        );
    }
    isEmpty() {
        return this.maxX() == 0 && this.maxY() == 0 && this.maxZ() == 0;
    }
    minX() {
        return this.minimumPoint.x;
    }
    minY() {
        return this.minimumPoint.y;
    }
    minZ() {
        return this.minimumPoint.z;
    }
    maxX() {
        return this.maximumPoint.x;
    }
    maxY() {
        return this.maximumPoint.y;
    }
    maxZ() {
        return this.maximumPoint.z;
    }
    clone() {
        return Cuboid.fromVectors(this.minimumPoint, this.maximumPoint);
    }
    /**
     * Returns an array of all possible points in a cuboid.
     */
    all() {
        const arr: Tensor<Vector>[] = [];
        for (let i = this.minX(); i < this.maxX(); i++)
            for (let j = this.minY(); j < this.maxY(); j++)
                for (let k = this.minZ(); k < this.maxZ(); k++)
                    arr.push(Tensor.from<Vector>(i, j, k));

        return arr;
    }
    /**
     * Creates a new Cuboid that has been contracted by the given amount, with positive changes
     * decreasing max values and negative changes increasing min values.
     * If the amount to contract by is larger than the length of a side, then the side will wrap (still creating a valid
     * AABB - see last sample).

    */
    contract(x: number, y: number, z: number) {
        let d0 = this.minX();
        let d1 = this.minY();
        let d2 = this.minZ();
        let d3 = this.maxX();
        let d4 = this.maxY();
        let d5 = this.maxZ();
        if (x < 0.0) d0 -= x;
        else if (x > 0.0) d3 -= x;

        if (y < 0.0) d1 -= y;
        else if (y > 0.0) d4 -= y;

        if (z < 0.0) d2 -= z;
        else if (z > 0.0) d5 -= z;

        return new Cuboid(d0, d1, d2, d3, d4, d5);
    }
    /**
     * Creates a new Cuboid that has been expanded by the given amount, with positive changes increasing
     * max values and negative changes decreasing min values.
     */
    expand(x: number, y: number, z: number) {
        let d0 = this.minX();
        let d1 = this.minY();
        let d2 = this.minZ();
        let d3 = this.maxX();
        let d4 = this.maxY();
        let d5 = this.maxZ();
        if (x < 0.0) d0 += x;
        else if (x > 0.0) d3 += x;

        if (y < 0.0) d1 += y;
        else if (y > 0.0) d4 += y;

        if (z < 0.0) d2 += z;
        else if (z > 0.0) d5 += z;

        return new Cuboid(d0, d1, d2, d3, d4, d5);
    }
    intersect(other: {
        minX: () => number;
        minY: () => number;
        minZ: () => number;
        maxX: () => number;
        maxY: () => number;
        maxZ: () => number;
    }) {
        const d0 = Math.max(this.minX(), other.minX());
        const d1 = Math.max(this.minY(), other.minY());
        const d2 = Math.max(this.minZ(), other.minZ());
        const d3 = Math.min(this.maxX(), other.maxX());
        const d4 = Math.min(this.maxY(), other.maxY());
        const d5 = Math.min(this.maxZ(), other.maxZ());
        return new Cuboid(d0, d1, d2, d3, d4, d5);
    }
    union(other: {
        minX: () => number;
        minY: () => number;
        minZ: () => number;
        maxX: () => number;
        maxY: () => number;
        maxZ: () => number;
    }) {
        const d0 = Math.min(this.minX(), other.minX());
        const d1 = Math.min(this.minY(), other.minY());
        const d2 = Math.min(this.minZ(), other.minZ());
        const d3 = Math.max(this.maxX(), other.maxX());
        const d4 = Math.max(this.maxY(), other.maxY());
        const d5 = Math.max(this.maxZ(), other.maxZ());
        return new Cuboid(d0, d1, d2, d3, d4, d5);
    }
    /**
     * Offsets the current bounding box by the specified amount.
     */
    offset(n = 1, x: number, y: number, z: number) {
        return new Cuboid(
            this.minX() + x * n,
            this.minY() + y * n,
            this.minZ() + z * n,
            this.maxX() + x * n,
            this.maxY() + y * n,
            this.maxZ() + z * n
        );
    }
    /**
     * Offsets the current bounding box by the specified amount.
     */
    offsetTensor(n = 1, vec: Tensor<Vector>) {
        return this.offset(n, vec.x, vec.y, vec.z);
    }
    /**
     * Offsets the current bounding box by the specified amount in a specified direction.
     */
    offsetDir(n = 1, dir: Direction) {
        const dirVec = Tensor.fromDirection(dir);

        dirVec.scale(n);
        // TODO: implement Cuboid#add method and sub method
        this.minimumPoint.add(dirVec);
        this.maximumPoint.add(dirVec);
        return this;
    }
    add(modifier: Cuboid) {
        if (modifier instanceof Cuboid) {
            this.minimumPoint.add(modifier.minimumPoint);
            this.maximumPoint.add(modifier.maximumPoint);
        } else {
            this.minimumPoint.add(modifier);
            this.maximumPoint.add(modifier);
        }
    }
    /**
     * Checks if the bounding box intersects with another.
     */
    intersectsCuboid(other: Cuboid) {
        return this.intersects(
            other.minX(),
            other.minY(),
            other.minZ(),
            other.maxX(),
            other.maxY(),
            other.maxZ()
        );
    }
    intersects(
        x1: number,
        y1: number,
        z1: number,
        x2: number,
        y2: number,
        z2: number
    ) {
        return (
            this.minX() < x2 &&
            this.maxX() > x1 &&
            this.minY() < y2 &&
            this.maxY() > y1 &&
            this.minZ() < z2 &&
            this.maxZ() > z1
        );
    }
    intersectsTensor(min: Tensor<Vector>, max: Tensor<Vector>) {
        return this.intersects(min.x, max.x, min.y, max.y, min.z, max.z);
    }
    /**
     * Returns if the supplied vector is compconstely inside the bounding box
     */
    containsTensor(v: Tensor<Vector>) {
        return this.contains(v.x, v.y, v.z);
    }
    contains(x: number, y: number, z: number) {
        return (
            x >= this.minX() &&
            x < this.maxX() &&
            y >= this.minY() &&
            y < this.maxY() &&
            z >= this.minZ() &&
            z < this.maxZ()
        );
    }
    /**
     * Returns the average length of the edges of the bounding box.
     */
    getAverageEdgeLength() {
        const d0 = this.maxX() - this.minX();
        const d1 = this.maxY() - this.minY();
        const d2 = this.maxZ() - this.minZ();
        return (d0 + d1 + d2) / 3.0;
    }
    /**
     * '
     *
     * @return the vector containing the minimum point of this cuboid
     */
    getMinPoint() {
        return this.minimumPoint;
    }
    /**
     * '
     *
     * @return the vector containing the maximum point of this cuboid
     */
    getMaxPoint() {
        return this.maximumPoint;
    }
    getSize() {
        return Tensor.from(
            this.maxX() - this.minX(),
            this.maxY() - this.minY(),
            this.maxZ() - this.minZ()
        );
    }
    static fromString(s: string) {
        try {
            const minMax = s.split(":");
            const minArr = minMax[0].split(",");
            const maxArr = minMax[1].split(",");
            const min = Tensor.from<Vector>(
                parseFloat(minArr[0]),
                parseFloat(minArr[1]),
                parseFloat(minArr[2])
            );
            const max = Tensor.from<Vector>(
                parseFloat(maxArr[0]),
                parseFloat(maxArr[1]),
                parseFloat(maxArr[2])
            );
            return this.fromVectors(min, max);
        } catch (err) {
            console.error(`Parsing error: ${err}`);
            return this.EMPTY;
        }
    }
    toString() {
        return (
            this.minimumPoint.toString() + ":" + this.maximumPoint.toString()
        );
    }
    getCenter() {
        return Tensor.from(
            this.minX() + (this.maxX() - this.minX()) * 0.5,
            this.minY() + (this.maxY() - this.minY()) * 0.5,
            this.minZ() + (this.maxZ() - this.minZ()) * 0.5
        );
    }
}
