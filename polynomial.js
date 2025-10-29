const fs = require('fs');

// Read file name from command line
const inputFile = process.argv[2];
if (!inputFile) {
    console.error("Usage: node polynomial.js <input.json>");
    process.exit(1);
}

// Parse JSON input
const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
const totalPoints = data.keys.n;
const threshold = data.keys.k;

let points = [];

// Decode values into (x, y) points
for (let key in data) {
    if (key !== "keys") {
        let x = BigInt(key);
        let base = parseInt(data[key].base);
        let valueStr = data[key].value;
        let y = BigInt(parseInt(valueStr, base));
        points.push({ x, y });
    }
}

console.log("Decoded Points (x, y):");
points.forEach(p => console.log(`(${p.x}, ${p.y})`));

// Use first 3 points for quadratic interpolation
let [p1, p2, p3] = points;

// Solve coefficients a, b, c
function interpolate(point1, point2, point3) {
    let [x1, y1] = [point1.x, point1.y];
    let [x2, y2] = [point2.x, point2.y];
    let [x3, y3] = [point3.x, point3.y];

    let denominator = (x1 - x2) * (x1 - x3) * (x2 - x3);

    let a = ((y1 * (x2 - x3)) + (y2 * (x3 - x1)) + (y3 * (x1 - x2))) / denominator;
    let b = ((y1 * (x3 ** 2n - x2 ** 2n)) + (y2 * (x1 ** 2n - x3 ** 2n)) + (y3 * (x2 ** 2n - x1 ** 2n))) / denominator;
    let c = ((y1 * (x2 * x3 * (x2 - x3))) + (y2 * (x3 * x1 * (x3 - x1))) + (y3 * (x1 * x2 * (x1 - x2)))) / denominator;

    return { a, b, c };
}

let { a, b, c } = interpolate(p1, p2, p3);

console.log(`\nSecret Constant c = ${c.toString()}`);
