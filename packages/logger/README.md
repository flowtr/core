# @flowtr/logger

An improved version of @toes/logger.

## Usage

## Loggers

```ts
import { createLogger } from "@flowtr/logger";

const logger = createLogger(console);
logger.info("Hello world!"); // Hello world!
```

## Color Loggers

```ts
import { createColoredLogger } from "@flowtr/logger";

const logger = createColoredLogger(console);
// Messages will be prefixed with level names that are color-coded

logger.info("Hello world!"); // [info] Hello world!
```
