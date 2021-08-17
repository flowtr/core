export class Wave {
    constructor(
        public amplitude: number,
        public period: number,
        public phase: number,
        public phaseIncrement = 0.05
    ) {}

    evaluate(x: number) {
        return (
            Math.sin(this.phase + (Math.PI * 2 * x) / this.period) *
            this.amplitude
        );
    }

    update() {
        this.phase += this.phaseIncrement;
    }
}
