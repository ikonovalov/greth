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
 * Created by ikonovalov on 05/05/17.
 */
module.exports = [
    {
        name: 'addr',
        type: String,
        alias: 'a',
        typeLabel: '[underline]{address_hex}',
        description: 'Contract address.'
    },
    {
        name: 'abi',
        type: String,
        alias: 'i',
        typeLabel: '[underline]{file_path}',
        description: 'ABI file location.'
    },
    {
        name: 'geth',
        type: String,
        defaultValue: 'http://localhost:8545',
        alias: 'g',
        typeLabel: '[underline]{http_url | file_path}',
        description: 'Geth RPC interface location. It is a HTTP url or a IPC path. Default value [underline]{http://localhost:8545}'
    },
    {
        name: 'anchor',
        type: Number,
        typeLabel: '[underline]{block}',
        alias: 'b',
        description: 'Base block. If not specified it equals highest confirmed block.'
    },
    {
        name: 'offset',
        type: Number,
        defaultValue: 2000,
        alias: 'o',
        typeLabel: '[underline]{in_blocks}',
        description: 'Scan N blocks in depth from an [bold]{anchor}. Default value is 2000.'
    },
    {
        name: 'output',
        type: String,
        defaultValue: 'console',
        typeLabel: '[underline]{console}',
        description: 'Output format. Default is a console.'
    },
    {
        name: 'version',
        alias: 'v',
        type: Boolean,
        description: 'True Story version.'
    },
    {
        name: 'verbosity',
        type: Number,
        defaultValue: 1,
        alias: 'L',
        typeLabel: '[underline]{1..3}',
        description: 'Verbosity level [1-3]. 1 - Low, 2 - Medium, 3 - High'
    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Here it is.'
    }
];