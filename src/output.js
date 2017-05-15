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
 * Created by ikonovalov on 11/05/17.
 */
const BigNumber = require('bignumber.js');

let toStr = function (value) {
    if (value.constructor === String)
        return value;
    if (value.constructor === BigNumber)
        return `0x${value.toString(16)}`;
    else
        return value.toString();

};

module.exports = {

    /**
     * @param decoded => {
     *       tx: tx,
     *       func: calledFunction,
     *       signature: inputSignature,
     *       params: inputDecodedParams
     *   }
     */
    console: (decoded, verbosity) => {
        console.log();
        let blockMessage = decoded.block.number;

        console.log(`Tx: ${decoded.tx.hash}`.bold);
        console.log(`   Block: ${blockMessage}`);
        if (verbosity.level > verbosity.low) {
            console.log(`   Time: \t${new Date(decoded.block.timestamp * 1000).toUTCString()}`);
            console.log(`   Miner: \t${decoded.block.miner}`);
        }
        console.log(`   From: \t${decoded.tx.from}`);
        console.log(`   Function: \t${decoded.call.func.displayName()}`.bold);
        console.log(`   Params \t[${decoded.call.func.typeName()}] {`);
        let params = decoded.call.params;
        params.forEach((p, idx) => {
            if (Array.isArray(p)) { // like uint256[]
                let reduced = p.reduce((prev, curr) => toStr(prev) + ", " + toStr(curr));
                console.log(`       #${idx}: [${reduced}]`);
            }
            else
                console.log(`       #${idx}: ${toStr(p)}`);
        });
        console.log(`   }`);
    },

    printFunctionTable: (solidityFunctions) => {
        let Table = require('cli-table');

        let funcTable = new Table({
            head: ["Functions", "SHA3(signature)", "Input arguments"],
            style: {
                head: ['green'],
                border: ['grey'],
                compact: true
            }
        });

        solidityFunctions.forEach(f => {
            let displayName = f.displayName();
            let sha3Signature = f.signature();
            let inputTypes = f.typeName();
            funcTable.push([displayName, sha3Signature, inputTypes.length > 0 ? inputTypes : "-"]);

        });
        console.log(funcTable.toString());
    }
};