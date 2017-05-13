/*
 *  Copyright (C) 2017 Igor Konovalov
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

"use strict";

require('colors');

const fs = require('fs'),
    Web3 = require('web3'),
    web3 = new Web3(),
    commandLineArgs = require('command-line-args'),
    getUsage = require('command-line-usage');

const optionDefinitions = require('./src/cli-options'),
    options = commandLineArgs(optionDefinitions);

if(options.version) {
    console.log(require('./package.json').version);
    process.exit(0);
}

if (options.help) {
    console.log(getUsage([
        {
            content: require('./src/ansi-header').red,
            raw: true
        },
        {
            header: 'Description',
            content: "Scan Ethereum network and outputs smart contract's related transactions."
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        }
    ]));
    process.exit(0);
}

const address = options.addr;
const gethUrl = options.geth;
const verb = {
    level: options.verbosity,
    low: 1,
    medium: 2,
    high: 3
};

// upload contract abi
const abi = JSON.parse(fs.readFileSync(options.abi, 'utf8'));
const SolidityFunction = require('web3/lib/web3/function');
const SolidityCoder = require('web3/lib/solidity/coder');

// initialize web3
if (gethUrl.startsWith('http')) {
    web3.setProvider(new Web3.providers.HttpProvider(gethUrl));
} else {
    // for instance: /mnt/u110/ethereum/pnet1/geth.ipc
    web3.setProvider(new Web3.providers.IpcProvider(gethUrl, require('net')));
}

let eth = web3.eth;

// prepare solidity functions
let functions = abi
    .filter(e => e.type === 'function')
    .map(fd => new SolidityFunction(eth, fd, address));

let funcMap = new Map();
functions.forEach(solFunc => {
    funcMap.set(solFunc.signature(), solFunc);
});


let decodeTxInput = function (inputData) {
    let inputSignature = inputData.substr(2, 8);
    let calledFunction = funcMap.get(inputSignature);
    let inputEncodedParams = inputData.slice(10);
    let inputDecodedParams = SolidityCoder.decodeParams(calledFunction._inputTypes, inputEncodedParams);
    return {
        func: calledFunction,
        signature: inputSignature,
        params: inputDecodedParams
    };
};

// setup output options
let outputs = require('./src/output');
let outputFunction = outputs[options.output];
if (options.output === 'console') {
    outputs.printFunctionTable(functions);
}

// determinate highest block
eth.getBlockNumber((error, blockNumber) => {
    if (error) {
        console.error(error);
        return;
    }

    // setup block range
    let anchorBlockNumber = options.anchor || blockNumber;
    let blockOffset = options.offset;
    let deepBlock = anchorBlockNumber - blockOffset > 0 ? anchorBlockNumber - blockOffset : 1;
    console.log(`Access URL: ${gethUrl}`);
    console.log(`Anchor block ${anchorBlockNumber}. Diving to ${deepBlock}.\n`);
    if (gethUrl.startsWith('http') && blockOffset > 1000)
        console.log(`We recommend you to use IPC instead of HTTP for a higher performance!`.yellow);

    let processBlock = function (block) {
        let transactions = block.transactions;
        for (let i = 0; i < transactions.length; i++) {
            let tx = transactions[i];
            if (tx.to === address) {
                let decodedInput = decodeTxInput(tx.input);
                outputFunction({
                    block: { // compact block presentation
                        number: block.number,
                        timestamp: block.timestamp,
                        miner: block.miner
                    },
                    tx: tx,
                    call: decodedInput
                }, verb);
            }
        }
    };

    let explore = function (blockNumber) {
        eth.getBlockTransactionCount(blockNumber, (error, txCount) => {
            if (error) {
                console.error(error);
                return;
            }
            if (txCount > 0) {
                eth.getBlock(blockNumber, true, (error, block) => {
                    if (!error) {
                        processBlock(block);
                    } else {
                        console.error(error)
                    }
                });
            }
            if (blockNumber === anchorBlockNumber) {
                console.log("\nDone \u262D".bold.green);
                process.exit();
            } else {
                setTimeout(explore, 0, blockNumber + 1)
            }
        });
    };

    // iterate on blocks
    explore(deepBlock);
});
