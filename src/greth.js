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

/**
 * Created by ikonovalov on 12/05/17.
 */
const
    EventEmitter = require('events'),
    SolidityFunction = require('web3/lib/web3/function'),
    SolidityCoder = require('web3/lib/solidity/coder');

let decodeTxInput = function (functionsMap, inputData) {
    let inputSignature = inputData.substr(2, 8);
    let func = functionsMap.get(inputSignature);
    let calledFunction = func.sol;
    let inputEncodedParams = inputData.slice(10);
    let inputDecodedParams = SolidityCoder.decodeParams(calledFunction._inputTypes, inputEncodedParams);
    return {
        func: func,
        signature: inputSignature,
        params: inputDecodedParams
    };
};

class Greth extends EventEmitter {

    constructor(web3) {
        super();
        this._web3 = web3;

    }
    abi(abi) {
        this._abi = abi;
        this._functionsMap = new Map();
        this._functions = abi
            .filter(e => e.type === 'function')
            .map(fd => {
                fd.inputsNames = fd.inputs ? fd.inputs.map(i => i.name) : [];
                return {
                    fd: fd,
                    sol: new SolidityFunction(this._web3.eth, fd)
                }
            });


        this._functions.forEach(func => {
            this._functionsMap.set(func.sol.signature(), func);
        });
        return this;
    }

    at(address) {
        if (!this._abi) {
            throw new Error('ABI is not specified');
        }
        return {
            trace: (blockOffset, anchorBlock) => {
                this._transcationsFor(address, blockOffset, anchorBlock)
            }
        }
    }

    get contractFunctions() {
        return this._functions;
    }

    _transcationsFor(address, blockOffset, anchorBlock) {
        let eth = this._web3.eth;
        let solFuncMap = this._functionsMap;

        eth.getBlockNumber((error, topBlockNumber) => {
            if (error) {
                this.emit('error', error);
                return;
            }

            let endBlockNumber = anchorBlock || topBlockNumber;
            let startBlockNumber = endBlockNumber - (blockOffset || 1000);
            if (startBlockNumber < 0)
                startBlockNumber = 1;


            this.emit('trace-start', {
                startBlock: startBlockNumber,
                endBlock: endBlockNumber
            });

            let processBlock = (block) => {
                let transactions = block.transactions;
                for (let i = 0; i < transactions.length; i++) {
                    let tx = transactions[i];
                    if (tx.to === address) {
                        let decodedInput = decodeTxInput(solFuncMap, tx.input);
                        this.emit('trace-next-tx',
                            {
                                block: { // compact block presentation
                                    number: block.number,
                                    timestamp: block.timestamp,
                                    miner: block.miner
                                },
                                tx: tx,
                                call: decodedInput
                            }
                        );
                    }
                }
            };

            let explore = (blockNumber) => eth.getBlockTransactionCount(blockNumber, (error, txCount) => {
                if (error) {
                    this.emit('error', error);
                    return;
                }
                if (txCount > 0) {
                    eth.getBlock(blockNumber, true, (error, block) => {
                        if (!error) {
                            if (blockNumber % 1000) { // just for a progress
                                this.emit('trace-pass-1000s', blockNumber);
                            }
                            processBlock(block)
                        } else {
                            this.emit('error', error)
                        }
                    });
                }
                if (blockNumber === endBlockNumber) {
                    this.emit('trace-finish')
                } else {
                    setTimeout(explore, 0, blockNumber + 1)
                }
            });

            explore(startBlockNumber);
        })
    }
}

module.exports = Greth;
