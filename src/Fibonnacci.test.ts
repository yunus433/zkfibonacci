import { FibonacciSequence, FibonacciSequenceProof, Fibonacci } from './Fibonacci';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate } from 'o1js';

let proofsEnabled = true;

describe('Fibonacci', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Fibonacci;

  beforeAll(async () => {
    if (proofsEnabled) await Fibonacci.compile();

    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount } =
      Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Fibonacci(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `Fibonacci` smart contract', async () => {
    await localDeploy();
    const number1State = zkApp.number1.get();
    const number2State = zkApp.number2.get();

    expect(number1State).toEqual(Field(1));
    expect(number2State).toEqual(Field(1));
  });

  it('correctly updates the state on the `Fibonacci` smart contract', async () => {
    const count = 3; // We will calculate the 4th element of the sequence

    let proof = await FibonacciSequence.baseCase();
    let number1 = Field(1);
    let number2 = Field(1);
    
    for (let i = 0; i < count; i++) {
      console.log(`The ${i + 2}. element of the Fibonacci sequence is ${number2.toBigInt()}`)
      proof = await FibonacciSequence.step(proof);

      const temp = number2;
      number2 = number1.add(number2);
      number1 = temp;
    }

    // update transaction
    const txn = await Mina.transaction(senderAccount, () => {
      zkApp.update(new FibonacciSequenceProof(proof));
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    const number1State = zkApp.number1.get();
    const number2State = zkApp.number2.get();

    expect(number1State).toEqual(number1);
    expect(number2State).toEqual(number2);

    console.log(`The ${count + 2}. element of the Fibonacci sequence is ${number2State.toString()}`);
  });
});
