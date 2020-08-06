# pfcurve.js

[![npm version](https://badge.fury.io/js/pfcurve.svg)](https://badge.fury.io/js/pfcurve)

pairing-friendly curve library

node.js and browser support (by `big-integer`)

## Support CURVEs

### BLS Curve
* bls12-381

### BN Curve
* bn462

## Performance

CPU : i9-9900K @ 3.6GHz

### native bigint vs pure big-integer

| count | bigint    | big-integer | bigint    | big-integer | 
| ----- | --------- | ----------- | --------- | ----------- |
|       | bls12-381 | bls12-381   | bn462     | bn462       |
| ----- | --------- | ----------- | --------- | ----------- |
| 1     | 79        | 251         | 104       | 603         |
| 2     | 74        | 240         | 97        | 585         |
| 3     | 72        | 270         | 98        | 615         |
| avg   | 75        | 254         | 100       | 601         |
| ratio | 1.0       | 3.38        | 1.0       | 6.01        |


### bls12-381 pairing
    √ GT test vector (56ms)
    √ should create negative G1 pairing (80ms)
    √ should create negative G2 pairing (79ms)
    √ should create proper pairing output order (77ms)
    √ should create right pairing with bilinearity on G1 (78ms)
    √ pairing should not degenerate (111ms)
    √ should create right pairing with bilinearity on G2 (146ms)
    √ should create right pairing composite check (172ms)

### bn462 pairing
    √ GT test vector (93ms)
    √ should create negative G1 pairing (167ms)
    √ should create negative G2 pairing (175ms)
    √ should create proper pairing output order (150ms)
    √ should create right pairing with bilinearity on G1 (172ms)
    √ pairing should not degenerate (259ms)
    √ should create right pairing with bilinearity on G2 (273ms)
    √ should create right pairing composite check (293ms)



## References
* https://tools.ietf.org/html/draft-irtf-cfrg-pairing-friendly-curves-07.html
* https://tools.ietf.org/html/draft-yonezawa-pairing-friendly-curves-02.html
* https://github.com/paulmillr/noble-bls12-381
* https://github.com/miracl/core
* https://github.com/herumi/mcl

