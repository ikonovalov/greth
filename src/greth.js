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
    let calledFunction = functionsMap.get(inputSignature);
    let inputEncodedParams = inputData.slice(10);
    let inputDecodedParams = SolidityCoder.decodeParams(calledFunction._inputTypes, inputEncodedParams);
    return {
        func: calledFunction,
        signature: inputSignature,
        params: inputDecodedParams
    };
};

let traceContract = (blockOffset, anchorBlock) => {
    let eth = this._web3.eth;
    let solFuncMap = this._solFuncMap;

    eth.getBlockNumber((error, topBlockNumber) => {
        if (error) {
            console.error(error);
            this.emit('error', error);
            return;
        }

        let endBlockNumber = (anchorBlock | topBlockNumber);

        let explore = (blockNumber) => eth.getBlockTransactionCount(blockNumber, (error, txCount) => {
            if (error) {
                console.error(error);
                return;
            }
            if (txCount > 0) {
                eth.getBlock(blockNumber, true, (error, block) => {
                    if (!error) {
                        let transactions = block.transactions;
                        for (let i = 0; i < transactions.length; i++) {
                            let tx = transactions[i];
                            if (tx.to === address) {
                                let decodedInput = decodeTxInput(solFuncMap, tx.input);
                                this.emit('next-tx',
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
                    } else {
                        this.emit('error', error)
                    }
                });
            }
            if (blockNumber === endBlockNumber) {
                this.emit('traverse-finish')
            } else {
                setTimeout(explore, 0, blockNumber + 1)
            }
        });

        explore((anchorBlock | topBlockNumber) - (blockOffset | 1000));
    })
};

class Greth extends EventEmitter {

    constructor(web3, abi) {
        super();
        this._web3 = web3;
        if (abi) {
            this._solFunctions = abi
                .filter(e => e.type === 'function')
                .map(fd => new SolidityFunction(this._web3.eth, fd));

            this._solFuncMap = new Map();
            this._solFunctions.forEach(solFunc => {
                this._solFuncMap.set(solFunc.signature(), solFunc);
            });
        }
    }

    contract(address) {
        return {
            trace : (blockOffset, anchorBlock) => {
                this._transcationsFor(address, blockOffset, anchorBlock)
            }
        }
    }

    get solFunctions() {
        return this._solFunctions;
    }

    _transcationsFor(address, blockOffset, anchorBlock) {
        let eth = this._web3.eth;
        let solFuncMap = this._solFuncMap;

        eth.getBlockNumber((error, topBlockNumber) => {
            if (error) {
                console.error(error);
                this.emit('error', error);
                return;
            }

            let endBlockNumber = (anchorBlock | topBlockNumber);
            let startBlockNumber = endBlockNumber - (blockOffset | 1000);


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
                            processBlock(block)
                        } else {
                            this.emit('error', error)
                        }
                    });
                }
                if (blockNumber === endBlockNumber) {
                    this.emit('traverse-finish')
                } else {
                    setTimeout(explore, 0, blockNumber + 1)
                }
            });

            explore(startBlockNumber);
        })
    }
}

module.exports = Greth;
