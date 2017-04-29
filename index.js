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
    {name: 'offset', type: Number, defaultValue: 50, alias: 's'},
    {name: 'scan-to', type: Number, defaultValue: Infinity, alias: 'e'},
    {name: 'fail-fast', type: Boolean, defaultValue: false},
    {name: 'help', alias: 'h', type: Boolean}
];
const options = commandLineArgs(optionDefinitions);
const address = options.addr;
const gethUrl = options.geth;

// upload contract abi
let abi = JSON.parse(fs.readFileSync(options.abi, 'utf8'));
const SolidityFunction = require('web3/lib/web3/function');

// initialize web3
web3.setProvider(new Web3.providers.HttpProvider(gethUrl));
let eth = web3.eth;
console.log(`Connected to ${web3.version.node}`);
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
functions.forEach(solf => funcTable.push([solf.displayName(), solf.signature()]));

console.log(funcTable.toString());

