const fs = require("fs");

// ---- Read JSON ----
const inputFile = process.argv[2] || "input.json";
const data = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

const { n, k } = data.keys;

// ---- Decode points ----
let points = Object.keys(data)
  .filter((key) => key !== "keys")
  .map((key) => ({
    x: BigInt(key),
    y: BigInt(parseInt(data[key].value, parseInt(data[key].base))),
  }));

points = points.slice(0, k); // use first k points

// ---- Build Vandermonde matrix (BigInt) ----
function buildMatrix(points) {
  const k = points.length;
  const A = [];
  const B = [];
  for (let i = 0; i < k; i++) {
    const row = [];
    for (let j = 0; j < k; j++) {
      row.push(points[i].x ** BigInt(j)); // x^j
    }
    A.push(row);
    B.push(points[i].y);
  }
  return { A, B };
}

// ---- Solve using Gaussian elimination (BigInt) ----
function solveBigInt(A, B) {
  const k = A.length;
  for (let i = 0; i < k; i++) {
    // make diagonal element = 1
    let div = A[i][i];
    for (let j = i; j < k; j++) A[i][j] = A[i][j] / div;
    B[i] = B[i] / div;

    // eliminate other rows
    for (let m = 0; m < k; m++) {
      if (m !== i) {
        let factor = A[m][i];
        for (let n = i; n < k; n++) {
          A[m][n] = A[m][n] - factor * A[i][n];
        }
        B[m] = B[m] - factor * B[i];
      }
    }
  }
  return B;
}

// ---- Main ----
const { A, B } = buildMatrix(points);
const coeffs = solveBigInt(A, B);

// ---- Constant term ----
const c = coeffs[0];

console.log("✅ Secret constant (c) =", c.toString());
