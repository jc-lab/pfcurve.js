# pfcurve.js

pairing-friendly curve library

## Support CURVEs

### BLS Curve
* bls12-381

### BN Curve
* bn462

## Performance

CPU : i9-9900K @ 3.6GHz



### bls12-381 pairing
* √ GT test vector (57ms)
* √ should create negative G1 pairing (88ms)
* √ should create negative G2 pairing (86ms)
* √ should create proper pairing output order (71ms)
* √ should create right pairing with bilinearity on G1 (98ms)
* √ pairing should not degenerate (137ms)
* √ should create right pairing with bilinearity on G2 (150ms)
* √ should create right pairing composite check (168ms)

### bn462 pairing
* √ GT test vector (101ms)
* √ should create negative G1 pairing (214ms)
* √ should create negative G2 pairing (213ms)
* √ should create proper pairing output order (170ms)
* √ should create right pairing with bilinearity on G1 (215ms)
* √ pairing should not degenerate (321ms)
* √ should create right pairing with bilinearity on G2 (312ms)
* √ should create right pairing composite check (329ms)


## References
* https://tools.ietf.org/html/draft-irtf-cfrg-pairing-friendly-curves-07
* https://tools.ietf.org/html/draft-yonezawa-pairing-friendly-curves-02.html
* https://github.com/paulmillr/noble-bls12-381
* https://github.com/miracl/core
