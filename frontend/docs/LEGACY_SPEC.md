# Legacy insight-ui functional spec (source of truth for the React rewrite)

Extracted from the AngularJS app at `public/src/js` + `public/views`, cross-checked against
insight-api and bitcore-node sources.

## Global

- API base: `window.apiPrefix = '/api'` (rewritten by the bitcore-node insight-ui service).
- Router: HTML5 mode, `<base href="/">` (also rewritten for routePrefix).
- Constants: BLOCKS_AMOUNT 15, TRANSACTION_DISPLAYED 10, BLOCKS_DISPLAYED 5, CHART_DAYS 14.
- localStorage prefs: `insight-currency` (FLUX default), `insight-language` (en).
- Detail-page fetch failures in legacy app redirected home with a flash message; the rewrite
  shows inline error states instead.

## Routes

| Path                                                  | Page                                                                 |
| ----------------------------------------------------- | -------------------------------------------------------------------- |
| `/`                                                   | Home (5 latest blocks live, 10 latest txs live via socket `inv`)     |
| `/blocks`, `/blocks-date/:blockDate/:startTimestamp?` | Blocks by date                                                       |
| `/block/:blockHash`                                   | Block detail                                                         |
| `/block-index/:blockHeight`                           | Resolve height → redirect to `/block/:hash`                          |
| `/tx/:txId/:v_type?/:v_index?`                        | Tx detail (`v_type` is `>` output / `<` input highlight)             |
| `/tx/send`                                            | Broadcast raw tx                                                     |
| `/address/:addrStr`                                   | Address                                                              |
| `/charts` (`?days=`)                                  | Supply chart                                                         |
| `/stats`                                              | 24h statistics dashboard                                             |
| `/stats/:type/:days`                                  | Single stat chart (transactions, outputs, fees, difficulty, nethash) |
| `/pools`, `/pools/:date`                              | Mining pools by date                                                 |
| `/status`                                             | Node status                                                          |
| `/network`                                            | Connected peers                                                      |
| `/fluxnodes`                                          | FluxNode list                                                        |
| `/rich-list`                                          | Distribution + top 200                                               |
| `/messages/verify`                                    | Verify signed message                                                |

## REST endpoints

- `GET /sync` → `{status:'syncing'|'finished', blockChainHeight, syncPercentage, height, error, type}`
- `GET /version` → `{version}`
- `GET /peer` → `{connected, host, port}`
- `GET /currency` → `{status, data:{rate, short}}` (USD rate)
- `GET /markets/info` → `{price, price_btc, market_cap_usd, total_volume_24h, delta_24h}`
- `GET /blocks?limit=n` or `?blockDate=YYYY-MM-DD&startTimestamp=unix` →
  `{blocks:[{height,size,hash,time,difficulty,txlength,poolInfo,isMainChain,minedBy}], length,
pagination:{next,prev,currentTs,current,isToday,more,moreTs?}}`
- `GET /block/:hash` → block detail (`tx: string[]`, `isPON` when header version >= 100,
  `blockType` 'Proof of Node'|'Proof of Work', `nodesCollateral {hash,index}`, `blockSignature`,
  `nonce`, `solution`, `bits`, `chainwork`, `reward`, `poolInfo`, `minedBy`,
  `previousblockhash`, `nextblockhash`, `merkleroot`, `version`, `confirmations`)
- `GET /block-index/:height` → `{blockHash}`
- `GET /tx/:txid` → full tx (see below)
- `GET /txs?block=:hash&pageNum=n` / `GET /txs?address=:addr&pageNum=n` → `{pagesTotal, txs}`
  (page size 10, pageNum 0-based)
- `POST /tx/send` `{rawtx}` → `{txid}`
- `GET /addr/:addr/?noTxList=1` → `{addrStr, balance, balanceSat, totalReceived, totalSent,
unconfirmedBalance, unconfirmedTxApperances, txApperances}`
- `POST /messages/verify` `{address, signature, message}` → `{result: boolean}`
- `GET /status?q=getInfo|getLastBlockHash|getMiningInfo|getPeerInfo|getFluxNodes`
  - getInfo → `{info:{version,protocolversion,blocks,timeoffset,connections,proxy,difficulty,
testnet,relayfee,errors,network,reward}}`
  - getLastBlockHash → `{syncTipHash, lastblockhash}`
  - getMiningInfo → `{miningInfo:{difficulty, networkhashps}}`
  - getPeerInfo → `{peerInfo:[{address, protocol?, version?, uptime?}]}`
  - getFluxNodes → `{fluxNodes:[{payment_address, tier, added_height, confirmed_height,
last_confirmed_height, last_paid_height, ip, network, txhash, outidx, pubkey,
activesince, lastpaid, amount, rank, collateral}]}`
- Statistics: `GET /statistics/total` (24h: `{n_blocks_mined, time_between_blocks(sec),
mined_currency_amount(sat), transaction_fees(sat), number_of_transactions,
outputs_volume(sat), difficulty, network_hash_ps, blocks_by_pool:[{address, poolName, url,
blocks_found, percent_total}]}`), `/statistics/pools-last-hour` (same shape),
  `/statistics/pools?date=YYYY-MM-DD` (`{date, n_blocks_mined, blocks_by_pool, pagination}`),
  `/statistics/supply?days=n`, `/statistics/transactions?days=n` (`transaction_count`),
  `/statistics/outputs?days=n` (`sum`), `/statistics/fees?days=n` (`fee`),
  `/statistics/difficulty?days=n` (`sum`), `/statistics/network-hash?days=n` (`sum`),
  `/statistics/richer-than` (`[{amount_usd, count_addresses}]`),
  `/statistics/balance-intervals` (`[{min,max,count,sum}]`),
  `/statistics/richest-addresses-list` (`[{address, balance, blocks_mined}]`),
  `/statistics/total-supply?format=object` (`{supply}`),
  `/statistics/circulating-supply?format=object` (`{circulatingSupply}`).
  Days param: server clamps to max 730; 'all' → 730. Responses newest-first — reverse for
  charts.

## Socket.io (server is socket.io v2 — client must be v2)

- Connect same-origin, `transports: ['websocket']`, `upgrade: false`.
- `emit('subscribe','inv')` → events: `tx` `{txid, valueOut, vout:[{addr:sat}], isRBF}`,
  `block` (hash string), `markets_info` (market payload).
- `emit('subscribe','bitcoind/addresstxid',[addr])` → event `bitcoind/addresstxid`
  `{address, txid}`; unsubscribe on unmount. Legacy app played a sound on new address tx.
- No socket sync events exist — sync via REST polling only.

## Transaction rendering rules

- Tx fields: `{txid, version, locktime, blockhash, blockheight, confirmations, size, time,
blocktime, firstSeenTs?, vin, vout, vjoinsplit, isCoinBase?, valueOut, valueIn?, fees?,
fOverwintered, nVersionGroupId, nExpiryHeight, valueBalance, spendDescs, outputDescs,
bindingSig?}` + FluxNode fields for v5/v6.
- **v5/v6 = FluxNode txes**: hide vin/vout/shielded entirely; show key/value table:
  Type (`type`; nType 2 = start, nType 4 = confirm), Collateral link
  (`collateralOutputHash`:`collateralOutputIndex`), Signature (`sig`), Sig time (`sigTime`),
  Collateral Public Key (v5 nType 2, or v6 nFluxNodeTxVersion bit 0x01 nType 2),
  Flux Node Public Key (`zelnodePubKey`/`fluxnodePubKey`, nType 2), Redeem Script (v6 bit
  0x02), and for nType 4: IP (`ip`), Update Type, Benchmark Tier/Signature/Sig time.
  v6 `nFluxNodeTxVersion` bitfield: 0x01 normal, 0x02 P2SH, 0x0100 delegates
  (`hasDelegates`, `delegateData.delegates[]`).
- Coinbase: `isCoinBase` → "No Inputs (Newly Generated Coins)", show coinbase hex, no fee.
- Aggregate vin/vout by address (sum sat values); non-standard: 'Unparsed address [i]';
  OP_RETURN outputs: decode ASCII payload after `OP_RETURN ` hex until 00 byte, label
  `OP_RETURN: <decoded>`.
- Shielded: `valueBalance < 0` → public input `-valueBalance`; `> 0` → public output;
  show `spendDescs.length` shielded spends → `outputDescs.length` shielded outputs.
  vjoinsplit entries: public input `vpub_old` / public output `vpub_new`.
- Outputs: spent flag red `(S)` when `spentTxId` (links `tx/{spentTxId}/</{spentIndex}`),
  green `(U)` unspent. Inputs link to outpoint `tx/{vin.txid}/>/{vin.vout}`.
- Fee rate = `fees * 1000 / size` FLUX/kB. Fee hidden for coinbase and v5/v6.
- Confirmations badge green when > 0, red "Unconfirmed" otherwise.
- Current address highlighted (not linked) in tx lists on the address page.

## Currency

`getConvertion(value)`: FLUX → 8dp with thousands separators; USD → `value * rate` (from
`/currency`), 2dp, `$X USD`; BTC → `value * price_btc` (markets/info). Store choice in
localStorage `insight-currency`.

## Known Flux address labels (shared constant)

Flux Foundation Locked: t3c51GjrkUg7pUiS8bzNdTnW2hD25egWUih, t3ZQQsd8hJNw6UQKYLwfofdL3ntPmgkwofH,
t3XjYMBvwxnXVv9jqg4CgokZ5f7BLCdVhvS · Flux Foundation Operational:
t1XWTigDqqBFp4kJGJgH8CpyriGrfV7DEjX, t1eabPBaLE2iyoAM5ZAnAMSbg5dLqSyAX83 · Flux Foundation
Mining: t1gZgxSErZTMFG3UTNVKXcSjbNMMYtj6K7q · Flux Listings Locked:
t3PMbbA5YvHH9F8DSquocGf3aDDvgHzBjHR · Flux Swap Pool Hot: t1abAp9oZ8SDDA1trwGarPPvKuzicin1JzP,
t1SHUuYiEdPMZzP41cbXBRWFGCJqcAcxSuy · Flux Swap Pool Cold: t1cjcLaDHkNcuF8QJUCJVrmDeCZBFH3ZfSt,
t1ZLpyVr69JLHqdgkG5v2FSisqiTMUFcxGT · Flux Swap Pool Locked:
t3ThbWogDoAjGuS6DEnmN1GWJBRbVjSUK4T, t3heoBJT9zGnPBtnbtSBqbNyBSBAHJUZQZ4 · Flux Coinbase Pool
Hot: t1Yum7okNqNjrLRhE7QF7kyGkGP9WVfPX7n, t1Zj9vUsA4691ykiBmVpm8N9dLEUE58WNSY

(Exact list in legacy `views/address.html` lines 8–22 / `rich_list.html`.)

## Legacy dead code intentionally dropped

Socket 'sync'/'status' rooms, mFLUX/bits currency modes, gettext i18n hard-reload flow,
QR camera scanner modal, per-render random pool chart colors (use stable palette).
