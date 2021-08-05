import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import cjs from "@rollup/plugin-commonjs";

export default [
    {
        input: "./src/index.ts",
        output: {
            file: "dist/index.cjs",
            format: "cjs"
        },
        plugins: [
            resolve({
                extensions: [".js", ".ts"]
            }),
            cjs({
                include: /node_modules/
            }),
            typescript()
        ]
    },
    {
        input: "./src/index.ts",
        output: {
            file: "dist/index.mjs",
            format: "es"
        },
        plugins: [
            resolve({
                extensions: [".js", ".ts"]
            }),
            cjs({
                include: /node_modules/
            }),
            typescript()
        ]
    }
];
