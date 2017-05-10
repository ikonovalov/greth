# True story, bro
Ethereum's contract history

## Installation

```bash    
npm install https://github.com/ikonovalov/true-story-bro
```

## Run bro
### Help
```bash
$./bin/bro --help
Options

  -a, --addr address_hex            Contract address.                                                             
  -i, --abi file_path               ABI file location.                                                            
  -g, --geth http_url | file_path   Geth RPC interface location. It is a HTTP url or a IPC path. Default value    
                                    http://localhost:8545                                                         
  -b, --anchor block                Base block. If not specified it equals highest confirmed block.               
  -o, --offset in_blocks            Scan N blocks in depth from an anchor. Default value is 2000.                 
  -v, --version                     True Story version.                                                           
  -h, --help                        Here it is.   
  ```
### Example
1) IPC access to a contract at 0x5abfa91dfe37f02f84933cb7ec23658072c7032f from the latest block to 2000 blocks deeper.
```bash
$ cd <BRO_HOME>
$ ./bin/bro --geth /mnt/u110/ethereum/pnet1/geth.ipc --addr 0x5abfa91dfe37f02f84933cb7ec23658072c7032f --abi /tmp/factory.json  --offset 2000
┌──────────────────────┬─────────────────┬─────────────────────────────────────────────────┐
│ Functions            │ SHA3(signature) │ Input arguments                                 │
├──────────────────────┼─────────────────┼─────────────────────────────────────────────────┤
│ version              │ 54fd4d50        │ -                                               │
│ destroy              │ 83197ef0        │ -                                               │
│ owner                │ 8da5cb5b        │ -                                               │
│ contractNumber       │ cbfbcc17        │ -                                               │
│ createLetterOfCredit │ d21caa5d        │ address[],uint256[],string,uint256,uint256,bool │
└──────────────────────┴─────────────────┴─────────────────────────────────────────────────┘
Access URL: /mnt/u110/ethereum/pnet1/geth.ipc
Anchor block 11572. Diving to 9572.


Block: 10767
   Tx: 0x05ad163005ea54b8602f8e8b7d763f74e20342d192b578d334d28232806a344a
   From: 0xb6e0f61fe0afa2306b9746e6da825fcb9924cfdc
   Function: createLetterOfCredit
   Params [address[],uint256[],string,uint256,uint256,bool] {
       #0: [0xb6e0f61fe0afa2306b9746e6da825fcb9924cfdc, 0x907ec85bb49fc5bfec980b83edc0ab4ab9facdb5, 0xe66468278347fa6887945c2bc52bf5c6ac90f876, 0xfc6fc74363384469bb53ba294bbec9b314a7d1f5]
       #1: [0xbd31aaf088827e272ec158efee42662403498213599a7c9e1ca0a4219cbf84a0, 0x75eed6a49ddd67c9a61e0f83222329b92f0616586f95acc4bec29baca1626266, 0x4c9058e5892bd2e448705448af10779493aed598a792a5839cffc752e6c7ed06, 0x50abef1f324ed87b7e645e063fb20a34055f48ad3b67a8ad9f4ba7e8ae38cd1d]
       #2: USD
       #3: 0x2710
       #4: 0x15a7aee8d4f
       #5: true
   }

Block: 10833
   Tx: 0x9a8fd93d71fc0743ed9b030e015ce265debf968ed19e632ecdccfbca90ca0415
   From: 0xb6e0f61fe0afa2306b9746e6da825fcb9924cfdc
   Function: createLetterOfCredit
   Params [address[],uint256[],string,uint256,uint256,bool] {
       #0: [0xb6e0f61fe0afa2306b9746e6da825fcb9924cfdc, 0x907ec85bb49fc5bfec980b83edc0ab4ab9facdb5, 0xfc6fc74363384469bb53ba294bbec9b314a7d1f5, 0xe66468278347fa6887945c2bc52bf5c6ac90f876]
       #1: [0xb02cc1758fb3c0dc5e5bc79c3db8a965c4a2ce1f45abaae7af1db6f002d9c12, 0x21efa1c68d988be434f60f6dd5078982adad90fbcd4749238e41db877a55c9da, 0x7e35fad770815c20581fb032b33e3b78d8b64d45cbf554920a0cb93cba92b01e, 0x7c600b5445275deb0d0695b814e339f8a592dee306fd3fcf47f38a0f6198db7e]
       #2: USD
       #3: 0x5a0743
       #4: 0x15a7c65a6c1
       #5: true
   }
.... and so on.
Done ☭
```
2) Same as above, but with HTTP access and specific an anchor block (10000). So we will scan 8000-10000 blocks.
```bash
$ ./bin/bro  --addr 0x5abfa91dfe37f02f84933cb7ec23658072c7032f --abi /tmp/factory.json --anchor 10000 --offset 2000
┌──────────────────────┬─────────────────┬─────────────────────────────────────────────────┐
│ Functions            │ SHA3(signature) │ Input arguments                                 │
├──────────────────────┼─────────────────┼─────────────────────────────────────────────────┤
│ version              │ 54fd4d50        │ -                                               │
│ destroy              │ 83197ef0        │ -                                               │
│ owner                │ 8da5cb5b        │ -                                               │
│ contractNumber       │ cbfbcc17        │ -                                               │
│ createLetterOfCredit │ d21caa5d        │ address[],uint256[],string,uint256,uint256,bool │
└──────────────────────┴─────────────────┴─────────────────────────────────────────────────┘
Access URL: http://localhost:8545
Anchor block 11572. Diving to 9572.

We recommend you to use IPC instead of HTTP for a higher performance!

Block: 10767
   Tx: 0x05ad163005ea54b8602f8e8b7d763f74e20342d192b578d334d28232806a344a
   From: 0xb6e0f61fe0afa2306b9746e6da825fcb9924cfdc
   Function: createLetterOfCredit
   Params [address[],uint256[],string,uint256,uint256,bool] {
       #0: [0xb6e0f61fe0afa2306b9746e6da825fcb9924cfdc, 0x907ec85bb49fc5bfec980b83edc0ab4ab9facdb5, 0xe66468278347fa6887945c2bc52bf5c6ac90f876, 0xfc6fc74363384469bb53ba294bbec9b314a7d1f5]
       #1: [0xbd31aaf088827e272ec158efee42662403498213599a7c9e1ca0a4219cbf84a0, 0x75eed6a49ddd67c9a61e0f83222329b92f0616586f95acc4bec29baca1626266, 0x4c9058e5892bd2e448705448af10779493aed598a792a5839cffc752e6c7ed06, 0x50abef1f324ed87b7e645e063fb20a34055f48ad3b67a8ad9f4ba7e8ae38cd1d]
       #2: USD
       #3: 0x2710
       #4: 0x15a7aee8d4f
       #5: true
   }

Block: 10833
   Tx: 0x9a8fd93d71fc0743ed9b030e015ce265debf968ed19e632ecdccfbca90ca0415
   From: 0xb6e0f61fe0afa2306b9746e6da825fcb9924cfdc
   Function: createLetterOfCredit
   Params [address[],uint256[],string,uint256,uint256,bool] {
       #0: [0xb6e0f61fe0afa2306b9746e6da825fcb9924cfdc, 0x907ec85bb49fc5bfec980b83edc0ab4ab9facdb5, 0xfc6fc74363384469bb53ba294bbec9b314a7d1f5, 0xe66468278347fa6887945c2bc52bf5c6ac90f876]
       #1: [0xb02cc1758fb3c0dc5e5bc79c3db8a965c4a2ce1f45abaae7af1db6f002d9c12, 0x21efa1c68d988be434f60f6dd5078982adad90fbcd4749238e41db877a55c9da, 0x7e35fad770815c20581fb032b33e3b78d8b64d45cbf554920a0cb93cba92b01e, 0x7c600b5445275deb0d0695b814e339f8a592dee306fd3fcf47f38a0f6198db7e]
       #2: USD
       #3: 0x5a0743
       #4: 0x15a7c65a6c1
       #5: true
   }
... and so on.
Done ☭
```

_Remember: HTTP access is much slower then IPC! But with HTTP you can access to remote node._

## License
[Apache-2.0](https://github.com/ikonovalov/true-story-bro/blob/master/LICENSE)
