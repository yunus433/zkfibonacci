# Mina zkApp: ZKFibonacci

Recursive ZK Fibonacci example, as an inspirational use case to ZK recursion. The zkApp state stores `n`th and `n+1`th element of the Fibonacci sequence, starting from `(1, 1)`. Using [recursive ZK Proofs](https://docs.minaprotocol.com/zkapps/o1js/recursion), any user can update the state of the zkApp to a bigger element of the Fibonacci sequence, without revealing any intermediary steps or the number `n`. As the proof is recursive, you can increase the step as much as you like in a single TX (without changing the gas cost). This usage gives a hint on the true potential of ZK. Just keep reading!

## Why Decentralized?

Using this app, anyone can read the last calculated state of the zkApp to learn a _big_ order of the Fibonacci Sequence. The computation is achieved off chain, but there is no trust on the computation. Thus, any zkApp on top of Mina Network can use this application to access a big order of a Fibonacci Sequence. 

## Why ZK?

Calculating a high order of the Fibonacci sequence (linearly) would require a lot of gas on an any other decentralized network. (Please note Fibonacci is not an excellent example, and the main idea of this code can be extended to any recursive sequence) In Mina, we achieve updating the trustless state in a constant time. All the heavy computation happens off chain, and anyone is able to use results of these off chain computations without trusting any 3rd party.

Moreover, we do not reveal any information in this zkApp but the `n`th and `n+1`th element of the Fibonacci sequence, without actually showing the intermediary steps of the sequence or the number `n`. It is certain that the two elements stored on the state are two consecutive members of the Fibonacci sequence, but no other information besides this is revealed.

## Important Note on the Concurrency Issue

In this app, there is no [concurrency problem](https://github.com/o1-labs/o1js/issues/265). The only requirement made inside the `update()` method is to make sure a TX raises the order of the Fibonacci Sequence. If multiple TXs happen at the same time, the app will always raise to the highest order ZK proof. As a result, if you have the highest order of Fibonacci sequence in your TX, then your TX is always accepted by the chain.

## The Bigger Idea

In theory, any off chain computation can be modeled as a recursive ZK proof. Thus, this method can be used to put the result of any computation on a decentralized network without using on chain computation power.

## How to Build

```sh
npm run build
```

## How to Run Tests

```sh
npm run test
npm run testw # watch mode
```

## How to Run Coverage

```sh
npm run coverage
```

## License

[Apache-2.0](LICENSE)
