import { Field, SelfProof, ZkProgram, Struct, SmartContract, state, State, method, FlexibleProvablePure } from 'o1js';

export class Pair extends Struct ({
  first: Field,
  second: Field,
}) {
  constructor(first: Field, second: Field) {
    super({ first, second });
    this.first = first;
    this.second = second;
  }
};

export const FibonacciSequence = ZkProgram({
  name: "fibonacci-sequence",
  publicOutput: Pair,

  methods: {
    baseCase: {
      privateInputs: [],

      method() {
        return new Pair(Field(1), Field(1));
      },
    },

    step: {
      privateInputs: [SelfProof],

      method(earlierProof: SelfProof<Pair, Pair>) {
        earlierProof.verify();

        const numbers = earlierProof.publicOutput;

        return new Pair(numbers.second, numbers.first.add(numbers.second));
      },
    },
  },
});

await FibonacciSequence.compile();

export class FibonacciSequenceProof extends ZkProgram.Proof(FibonacciSequence) {};

export class Fibonacci extends SmartContract {
  @state(Field) number1 = State<Field>();
  @state(Field) number2 = State<Field>();

  async init() {
    super.init();
    this.number1.set(Field(1));
    this.number2.set(Field(1));
  };

  @method update(
    proof: FibonacciSequenceProof
  ) {
    proof.verify();

    // To make sure our sequence always gets bigger
    proof.publicOutput.first.assertGreaterThan(this.number1.getAndRequireEquals()); // This assertion does not result in a concurrency issue. We always accept the biggest order sequence TX in a block. See the README.md for more details.

    this.number1.set(proof.publicOutput.first);
    this.number2.set(proof.publicOutput.second);
  };
};
