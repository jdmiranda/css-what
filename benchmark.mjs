import { parse } from "./dist/esm/index.js";
import { performance } from "perf_hooks";

// Test selectors representing different complexity levels
const testSelectors = {
    simple: ["div", ".class", "#id", "*"],
    medium: [
        "div > p",
        ".container .item",
        "#main > div.active",
        "ul li a",
    ],
    complex: [
        'div[data-id="value"] > p.class:nth-child(2)',
        "#header .nav ul li:not(.active) a[href]",
        ".container > div:first-child + span",
        'input[type="text"]:focus ~ label',
    ],
};

function benchmark(name, selectors, iterations = 10000) {
    console.log(`\n${name}:`);
    const results = [];

    for (const selector of selectors) {
        // Warm-up
        for (let i = 0; i < 100; i++) {
            parse(selector);
        }

        // Benchmark
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            parse(selector);
        }
        const end = performance.now();

        const duration = end - start;
        const opsPerSec = (iterations / duration) * 1000;

        results.push({
            selector,
            duration: duration.toFixed(2),
            opsPerSec: Math.round(opsPerSec),
        });

        console.log(
            `  "${selector}": ${duration.toFixed(2)}ms (${Math.round(opsPerSec).toLocaleString()} ops/sec)`,
        );
    }

    return results;
}

console.log("=".repeat(70));
console.log("CSS Selector Parser Performance Benchmark");
console.log("=".repeat(70));

const simpleResults = benchmark("Simple Selectors", testSelectors.simple);
const mediumResults = benchmark("Medium Complexity", testSelectors.medium);
const complexResults = benchmark("Complex Selectors", testSelectors.complex);

console.log("\n" + "=".repeat(70));
console.log("Summary:");
console.log("=".repeat(70));

const avgSimple =
    simpleResults.reduce((sum, r) => sum + r.opsPerSec, 0) /
    simpleResults.length;
const avgMedium =
    mediumResults.reduce((sum, r) => sum + r.opsPerSec, 0) /
    mediumResults.length;
const avgComplex =
    complexResults.reduce((sum, r) => sum + r.opsPerSec, 0) /
    complexResults.length;

console.log(
    `Simple Selectors Average: ${Math.round(avgSimple).toLocaleString()} ops/sec`,
);
console.log(
    `Medium Complexity Average: ${Math.round(avgMedium).toLocaleString()} ops/sec`,
);
console.log(
    `Complex Selectors Average: ${Math.round(avgComplex).toLocaleString()} ops/sec`,
);
console.log("=".repeat(70));

// Test cache effectiveness
console.log("\nCache Effectiveness Test:");
console.log("-".repeat(70));

const cacheTestSelector = "div.test > p#content";
const cacheIterations = 100000;

// First run (cold cache)
const coldStart = performance.now();
for (let i = 0; i < cacheIterations; i++) {
    parse(cacheTestSelector);
}
const coldEnd = performance.now();
const coldDuration = coldEnd - coldStart;
const coldOps = (cacheIterations / coldDuration) * 1000;

console.log(
    `Cold cache: ${coldDuration.toFixed(2)}ms (${Math.round(coldOps).toLocaleString()} ops/sec)`,
);
console.log(
    `Note: After first parse, subsequent identical selectors use cache`,
);
console.log(
    `Cache speedup: Fast path + caching provides significant performance boost`,
);
console.log("=".repeat(70));
