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

//../../utils amountFormatter may come in handy

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
export default function Bridge({ params = defaultBridgeParams }) {
  const [transferValue, setTransferValue] = useState(0)
  const [selectedInput, setInput] = useState('ETH')
  const [selectedOutput, setOutput] = useState('')

  const { connector, connectorName, library } = useWeb3Context()
  const { t: translated } = useTranslation()
  console.log(connectorName)
  const { balances } = useArbTokenBridge(
    process.env.REACT_APP_ARB_VALIDATOR_URL,
    // new ethers.providers.Web3Provider(library.provider),
    new ethers.providers.Web3Provider(window.ethereum),
    0
  )
  const testBals = {
    'ETH': {
      balance: balances.eth.balance,
      ethRate: ethers.constants.One
    },
    '0x0000000000000000000000000000000000000065': {
      balance: ethers.utils.bigNumberify(99999),
      ethRate: ethers.constants.One,
    },
    '0xD02bEC7Ee5Ee73A271B144E829EeD1C19218D813': {
      balance: ethers.utils.bigNumberify(99999),
      ethRate: ethers.constants.One,
    }
  }

  const allTokens = {
    '0x0000000000000000000000000000000000000065': {
      name: 'Arbitrum ETH',
      symbol: 'ETH',
      decimals: 18,
      exchangeAddress: null,
    },
    '0xD02bEC7Ee5Ee73A271B144E829EeD1C19218D813': {
      name: 'test',
      symbol: 'TST',
      decimals: 18,
      exchangeAddress: null,
    }
  }

  useEffect(() => {

  })

  console.log('test bal', testBals['ETH'].balance)

  return (
    <>
      <CurrencyInputPanel
        title={translated('input')}
        allBalances={testBals}
        extraText={'Balance: ' + amountFormatter(testBals['ETH'].balance, 18, 4)}
        // description={"poop"}
        onValueChange={setTransferValue}
        extraTextClickHander={() => {
          // if (inputBalance) {
          //   const valueToSet = inputBalance.sub(ethers.utils.parseEther('.1'))
          //   if (valueToSet.gt(ethers.constants.Zero)) {
          //     dispatchAddLiquidityState({
          //       type: 'UPDATE_VALUE',
          //       payload: { value: amountFormatter(valueToSet, 18, 18, false), field: INPUT }
          //     })
          //   }
          // }
        }}
        selectedTokenAddress={selectedInput}
        value={transferValue}
        modalPropOverrides={{ allTokens }}
      // errorMessage={inputError}
      />

      <OversizedPanel>
        <DownArrowBackground>
          {/* could do a cool loading animation here modulating `active` */}
          <DownArrow active={true} alt="arrow" />
        </DownArrowBackground>
      </OversizedPanel>

      <CurrencyInputPanel
        allBalances={testBals}
        title={translated('output')}
        extraText={'Balance: ' + amountFormatter(testBals['ETH'].balance, 18, 4)}
        // onValueChange={}
        extraTextClickHander={() => {
          // if (inputBalance) {
          //   const valueToSet = inputBalance.sub(ethers.utils.parseEther('.1'))
          //   if (valueToSet.gt(ethers.constants.Zero)) {
          //     dispatchAddLiquidityState({
          //       type: 'UPDATE_VALUE',
          //       payload: { value: amountFormatter(valueToSet, 18, 18, false), field: INPUT }
          //     })
          //   }
          // }
        }}
        selectedTokenAddress={selectedOutput}
        value={transferValue}
        modalPropOverrides={{ allTokens }}
      // errorMessage={inputError}
      />

      <ButtonContainer>
        <Button
        // disabled={!isValid || customSlippageError === 'invalid'}
        // onClick={onSwap}
        // warning={highSlippageWarning || customSlippageError === 'warning'}
        >
          {/* text should provide destination context */}
          {translated('Transfer to Arbitrum Wallet')}
        </Button>
      </ButtonContainer>
    </>
  )
}