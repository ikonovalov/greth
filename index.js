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
const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3();
const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage');

const optionDefinitions = [
    {name: 'addr', type: String, alias: 'a'},
    {name: 'abi', type: String, alias: 'i'},
    {name: 'geth', type: String, defaultValue: 'http://localhost:8545', alias: 'g'},
    {name: 'anchor', type: Number},
    {name: 'offset', type: Number, defaultValue: 100},
    {name: 'help', alias: 'h', type: Boolean}
];
const options = commandLineArgs(optionDefinitions);
const address = options.addr;
const gethUrl = options.geth;

// upload contract abi
const abi = JSON.parse(fs.readFileSync(options.abi, 'utf8'));
const SolidityFunction = require('web3/lib/web3/function');
const SolidityCoder = require('web3/lib/solidity/coder');

// initialize web3
//web3.setProvider(new Web3.providers.HttpProvider(gethUrl));
web3.setProvider(new Web3.providers.IpcProvider('/mnt/u110/ethereum/pnet1/geth.ipc', require('net')));
const eth = web3.eth;

// prepare functions
let functions = abi
    .filter(e => e.type == 'function')
    .map(fd => new SolidityFunction(eth, fd, address));

let Table = require('cli-table');
let funcTable = new Table({
    head: ["Functions", "SHA3(signature)"],
    style: {
        head: ['green'],
        border: ['grey'],
        compact: true
    }
});

let funcMap = new Map();
functions.forEach(sfunc => {
    funcTable.push([sfunc.displayName(), sfunc.signature()]);
    funcMap.set(sfunc.signature(), sfunc);
});

console.log(funcTable.toString());

// functions
let decodeTxInput = function (tx) {
    let inputData = tx.input;
    let inputSignature = inputData.substr(2, 8);
    let calledFunction = funcMap.get(inputSignature);
    let inputEncodedParams = inputData.slice(10);
    let inputDecodedParams = SolidityCoder.decodeParams(calledFunction._inputTypes, inputEncodedParams);
    return {
        tx: tx,
        func: calledFunction,
        signature: inputSignature,
        params: inputDecodedParams
    };
};

let consolePrint = function (decoded) {
    console.log(`Block: ${decoded.tx.blockNumber}`)
    console.log(`   Tx: ${decoded.tx.hash}`)
    console.log(`   Function: ${decoded.func.displayName()}`)
    console.log(`   Params [${decoded.func.typeName()}] {`);
    decoded.params.forEach(p => {
        console.log(`       ${p}`);
    });
    console.log(`   }`);
};

let outputFunction = consolePrint;

// prepare scan transactions
eth.getBlockNumber((error, blockNumber) => {
    if (error) {
        console.error(error);
        return;
    }

    let anchorBlockNumber = options.anchor || blockNumber;
    let blockOffset = options.offset;
    let deepBlock = anchorBlockNumber - blockOffset;
    console.log(`Last block ${anchorBlockNumber}. Diving to ${deepBlock}.`);

    let processBlock = function (block) {
        let transactions = block.transactions;
        for (let i = 0; i < transactions.length; i++) {
            let tx = transactions[i];
            if (tx.to === address) {
                let decodedInput = decodeTxInput(tx);
                outputFunction(decodedInput);
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
            if (blockNumber == anchorBlockNumber) {
                console.log("Done")
            } else {
                setTimeout(explore, 0, blockNumber + 1)
            }
        });
    };

    // iterate on blocks
    explore(deepBlock);
});


