import React, { useState, useEffect } from 'react'
import { useWeb3Context } from 'web3-react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useArbTokenBridge } from 'arb-token-bridge/dist/hooks/useArbTokenBridge'
import { ethers, utils } from 'ethers'

import { Button } from '../../theme'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import OversizedPanel from '../../components/OversizedPanel'
import { DownArrow, DownArrowBackground } from '../../components/ExchangePage'
import { amountFormatter } from '../../utils'


const defaultBridgeParams = {

}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;

  button {
    max-width: 20rem;
  }
`

// default view in the bridge should be the two eth balances on either side
// there should be some sort of explanation of how to view tutorials

// to add a token, we can have an option in the token select area. but will that
// be clear enough?

// what won't fit into the existing flow is withdrawing lockbox
// and displaying lockbox amount. also need to explain what it is

// allBalances should be a mapping of
// {[addressOrEth: string]: {balance: BigNumber, ethRate: BigNumber}}

// internally, CurrencyInputPanel's modal consumes the balance data along
// with an internally fetched token list via useAllTokenDetails with interface
// {[addressOrEth: string]: {
//   decimals: number,
//   exchangeAddress: string || null,
//   name: string
//   symbol: string
// }}

// it maps the balances to tokens
// that exist in its internal list, mapping the data to the format below
// {[addressOrEth: string]: {
//    name: string
//    symbol: string
//    address: string
//    balance: BigNumber
//    usdBalance: BigNumber
// }}

// TODO symbol image search overrides

const ETH_TOKEN = 'ETH'
const ARB_ETH_TOKEN = 'AETH'

export default function Bridge({ params = defaultBridgeParams }) {
  const [transferValue, setTransferValue] = useState('0')
  const [selectedInput, setInput] = useState(ETH_TOKEN)
  const [selectedOutput, setOutput] = useState(ARB_ETH_TOKEN)

  const { connector, connectorName, library } = useWeb3Context()
  const { t: translated } = useTranslation()
  console.log(connectorName)
  const { balances, bridgedTokens, ...bridge } = useArbTokenBridge(
    process.env.REACT_APP_ARB_VALIDATOR_URL,
    // new ethers.providers.Web3Provider(library.provider),
    new ethers.providers.Web3Provider(window.ethereum),
    0
  )

  const combinedEthDetails = {
    [ETH_TOKEN]: {
      name: 'Ethereum',
      symbol: ETH_TOKEN,
      decimals: 18,
      exchangeAddress: null,
      balance: balances.eth.balance,
      ethRate: ethers.constants.One
    }
  }

  const combinedArbDetails = {
    [ETH_TOKEN]: {
      name: `Ethereum @ Arbitrum Rollup ${bridge.vmId ?? '0x'}`,
      symbol: ETH_TOKEN,
      decimals: 18,
      exchangeAddress: null,
      balance: balances.eth.arbChainBalance,
      ethRate: ethers.constants.One,
    },
  }

  // TODO how to handle arb vs eth contracts due to same address?
  const transferType = {
    toArb: 1,
    fromArb: 2,
    fromLockbox: 3
  }
  // each should set input / output as needed

  // eth - balance transfer + lockbox withdraw
  // erc20 - user add + select contract, balance transfer + lockbox withdraw
  // erc721 - user add + select contract, list tokens, transfer token ids, lockbox

  for (const addr in balances.erc20) {
    const token = bridgedTokens[addr]
    combinedEthDetails[addr] = {
      name: token.name,
      symbol: token.symbol,
      decimals: token.units,
      balance: balances.erc20[addr].balance,
      ethRate: ethers.constants.One,
      exchangeAddress: null,
    }
    combinedArbDetails[addr] = {
      name: token.name,
      symbol: token.symbol,
      decimals: token.units,
      balance: balances.erc20[addr].balance,
      ethRate: ethers.constants.One,
      exchangeAddress: null,
    }
  }

  // TODO how to display NFTs? token ids? number of tokens?
  for (const addr in balances.erc721) {
    const token = bridgedTokens[addr]
    combinedEthDetails[addr] = {
      name: token.name,
      symbol: token.symbol,
      decimals: 0,
      balance: balances.erc721[addr].tokens.length,
      ethRate: ethers.constants.One,
      exchangeAddress: null,
    }
    combinedArbDetails[addr] = {
      name: token.name,
      symbol: token.symbol,
      decimals: token.units,
      balance: balances.erc20[addr].balance,
      ethRate: ethers.constants.One,
      exchangeAddress: null,
    }
  }

  useEffect(() => {

  })

  const handleClick = () => {
    // bridge.eth.deposit(transferValue).then((...args) => console.log('deposit complete', args)).catch(console.error)
    bridge.eth.withdraw(transferValue).then((...args) => console.log('deposit complete', args)).catch(console.error)
  }

  console.log('test bal', balances)

  // use existing unlock button in currency input panel to approve tokens
  // use transfer states to decide tokens
  return (
    <>
      <CurrencyInputPanel
        title={translated('input')}
        description={"input description"}
        allBalances={combinedEthDetails}
        allTokens={combinedEthDetails}
        onValueChange={setTransferValue}
        extraText={'Balance: ' + amountFormatter(combinedEthDetails[selectedInput].balance, 18, 4)}
        extraTextClickHander={() => balances.update()}
        selectedTokenAddress={selectedInput}
        value={transferValue}
        disableTokenSelect
      // errorMessage={inputError}
      />

      <OversizedPanel>
        <DownArrowBackground>
          {/* could do a cool loading animation here modulating `active` */}
          <DownArrow active={true} alt="arrow" />
        </DownArrowBackground>
      </OversizedPanel>

      <CurrencyInputPanel
        title={translated('output')}
        description={'output description'}
        allBalances={combinedArbDetails}
        allTokens={combinedArbDetails}
        // onValueChange={} // should always be the same as input
        extraText={'Balance: ' + amountFormatter(combinedArbDetails[selectedOutput].balance, 18, 4)}
        extraTextClickHander={() => balances.update()}
        selectedTokenAddress={selectedOutput}
        value={transferValue}
        disableTokenSelect
      // errorMessage={inputError}
      />

      <ButtonContainer>
        <Button
          // disabled={!isValid || customSlippageError === 'invalid'}
          onClick={handleClick}
        // warning={highSlippageWarning || customSlippageError === 'warning'}
        >
          {/* text should provide destination context */}
          {translated('Transfer to Arbitrum Wallet')}
        </Button>
      </ButtonContainer>
    </>
  )
}