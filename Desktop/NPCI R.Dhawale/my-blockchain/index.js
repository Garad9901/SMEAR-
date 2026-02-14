const { Block, Blockchain } = require('../blockchain.js');

let myBlockchain = new Blockchain();

console.log('Mining block 1...');
myBlockchain.addBlock(new Block(1, "20/07/2023", { amount: 4 }));

console.log('Mining block 2...');
myBlockchain.addBlock(new Block(2, "20/07/2023", { amount: 8 }));

console.log('Mining block 3...');
myBlockchain.addBlock(new Block(3, "20/07/2023", { message: "Hello world" }));

console.log('Blockchain valid?', myBlockchain.isChainValid());

// Test tampering: change data of the second block
myBlockchain.chain[1].data = { amount: 100 };
console.log('After tampering with block 1 data, Blockchain valid?', myBlockchain.isChainValid());

console.log(JSON.stringify(myBlockchain, null, 4));
