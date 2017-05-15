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

const
    fs = require('fs'),
    Web3 = require('web3'),
    web3 = new Web3(),
    commandLineArgs = require('command-line-args'),
    getUsage = require('command-line-usage');

const
    optionDefinitions = require('./src/cli-options'),
    options = commandLineArgs(optionDefinitions);

// print version only
if(options.version) {
    console.log(require('./package.json').version);
    process.exit(0);
}

// print help only
if (options.help) {
    console.log(getUsage([
        {
            content: require('./src/ansi-header').green,
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

// setup web3 RPC provider
if (gethUrl.startsWith('http')) {
    web3.setProvider(new Web3.providers.HttpProvider(gethUrl));
} else {
    // for instance: /mnt/u110/ethereum/pnet1/geth.ipc
    web3.setProvider(new Web3.providers.IpcProvider(gethUrl, require('net')));
}

// Create GrEth
let Greth = require('./src/greth');
let greth = new Greth(web3, abi);

// setup output options
let outputs = require('./src/output');
let outputFunction = outputs[options.output];

if (options.output === 'console') {
    if (verb.level > verb.medium) {
        outputs.printFunctionTable(greth.solFunctions);
    }
}

greth.contract(address).trace(3000);

greth.on('trace-start', context => {
    console.log(`Anchor block ${context.endBlock}. Diving to ${context.startBlock}.`);
});

greth.on('trace-next-tx', (obj) => {
    outputFunction(obj, verb)
});

greth.on('error', error => {
    console.error(error)
});

greth.on('traverse-finish', () => {
    console.log("\nDone \u262D".bold.green);
    process.exit(0);
});
