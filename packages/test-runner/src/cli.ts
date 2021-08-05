// import esbuild from "esbuild";
// TODO: esbuild-runner as optional dep?
import { transpile } from "esbuild-runner";
import { createColoredLogger } from "@flowtr/logger";
import { program, command } from "bandersnatch";
import fs from "fs";
import glob from "tiny-glob";
import { NodeVM } from "vm2";
import path from "path";
import { TestRunner, Test } from ".";

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
const logger = createColoredLogger(console);

const runCommand = command("run")
    .description("Runs test files using esbuild.")
    .option("input", { default: "**/*.test.ts", alias: "i" })
    .action(async (args) => {
        // Make sure test folder exists, otherwise provide a simple error message
        try {
            if (!args.input.startsWith("*"))
                await fs.promises.access(
                    path.dirname(args.input),
                    fs.constants.F_OK
                );
        } catch (err) {
            logger.error(
                "Test folder does not exist: %s",
                path.dirname(args.input)
            );
            process.exit(0);
        }

        const files = await glob(args.input, {
            cwd: process.cwd()
        });
        if (files.length === 0) {
            logger.error("No files to test.");
            process.exit(0);
        }
        for await (const file of files) {
            const filePath = path.join(process.cwd(), file);
            const contents = transpile(
                await fs.promises.readFile(filePath, "utf-8"),
                filePath,
                { type: "bundle", esbuild: {} }
            );
            const vm = new NodeVM({
                console: "inherit",
                wrapper: "commonjs",
                require: {
                    external: true
                },
                sourceExtensions: ["js", "cjs"]
            });
            const fileName = path.basename(file);
            const tests: Test[] = vm.run(contents, filePath).default;
            // TODO: hooks
            for await (const test of tests)
                await new TestRunner().handle(test, fileName);
        }
    });
program().default(runCommand).run();
