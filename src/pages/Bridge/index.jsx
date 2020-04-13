import React, { useState, useEffect } from 'react'
import { useWeb3Context } from 'web3-react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useArbTokenBridge, TokenType } from 'arb-token-bridge/dist/hooks/useArbTokenBridge'
import { ethers } from 'ethers'
import { lighten } from 'polished'

import { Button } from '../../theme'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import OversizedPanel from '../../components/OversizedPanel'
import Modal from '../../components/Modal'
import { DownArrow, DownArrowBackground } from '../../components/ExchangePage'
import { amountFormatter } from '../../utils'
import { ColoredDropdown } from '../Pool/ModeSelector'


const defaultBridgeParams = {

}

const TransferTypeSelection = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.royalBlue};
  font-weight: 500;
  cursor: pointer;

  :hover {
    color: ${({ theme }) => lighten(0.1, theme.royalBlue)};
  }

  img {
    height: 0.75rem;
    width: 0.75rem;
  }
`

const TransferTypeModal = styled.div`
  background-color: ${({ theme }) => theme.inputBackground};
  width: 100%;
  height: 100%;
  padding: 2rem 0 2rem 0;
`

const ModalOption = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  padding: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.doveGray};
  font-size: 1rem;

  &.active {
    background-color: ${({ theme }) => theme.inputBackground};
    border-radius: 3rem;
    border: 1px solid ${({ theme }) => theme.mercuryGray};
    font-weight: 500;
    color: ${({ theme }) => theme.royalBlue};
  }

  &:hover {
    color: ${({ theme }) => lighten(0.1, theme.royalBlue)};
  }
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;

  button {
    max-width: 20rem;
  }
`

// there should be some sort of explanation of how to view tutorials
// to add a token, we can have an option in the token select area. but will that
// be clear enough?

// TODO symbol image search overrides for each symbol if possible
// TODO create exchange when adding token?
const TransferType = {
  toArb: 1,
  fromArb: 2,
}

const ETH_TOKEN = 'ETH'

// TODO handle contract not existing in arbitrum - here or in hook?
// TODO always display lockbox balances + explain
// TODO display full rollup address somewhere
export default function Bridge({ params = defaultBridgeParams }) {
  const [transferType, setTransferType] = useState(TransferType.toArb)
  const [transferValue, setTransferValue] = useState()
  const [selectedToken, setToken] = useState(ETH_TOKEN)
  const [modalOpen, setModalOpen] = useState(false)

  // const { connector, connectorName, library } = useWeb3Context()
  const { t: translated } = useTranslation()
  const { balances, bridgeTokens, ...bridge } = useArbTokenBridge(
    process.env.REACT_APP_ARB_VALIDATOR_URL,
    // new ethers.providers.Web3Provider(library.provider),
    new ethers.providers.Web3Provider(window.ethereum),
    0,
    true
  )

  const vmIdParsed = bridge.vmId.slice(0, 20) || '0x'

  const transferTypeNames = {
    [TransferType.toArb]: `Ethereum -> Arbitrum Rollup @ ${vmIdParsed}...`,
    [TransferType.fromArb]: ` Arbitrum ${vmIdParsed}... -> Ethereum`
  }

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
      ...combinedEthDetails[ETH_TOKEN],
      name: `Ethereum @ Arbitrum Rollup ${vmIdParsed}`,
      balance: balances.eth.arbChainBalance
    },
  }

  for (const addr in balances.erc20) {
    const token = bridgeTokens[addr]
    combinedEthDetails[addr] = {
      name: token.name,
      symbol: token.symbol,
      decimals: token.units,
      balance: balances.erc20[addr].balance,
      ethRate: ethers.constants.One,
      exchangeAddress: null,
    }
    combinedArbDetails[addr] = {
      ...combinedEthDetails[addr],
      balance: balances.erc20[addr].arbChainBalance,
    }
  }

  // 0x8205bd0BcF13F90d25721CDD6643D7e8b557a3f5
  const handleSelectToken = (address) => {
    let maybePromise
    if (!bridgeTokens[address]) {
      console.log('adding token')
      maybePromise = bridge.token.add(address, TokenType.ERC20)
    }

    return Promise.resolve(maybePromise).then(() => setToken(address))
  }

  const handleButtonClick = () => {
    bridge.eth.deposit(transferValue).then((...args) => console.log('deposit complete', args)).catch(console.error)
    // bridge.eth.withdraw(transferValue).then((...args) => console.log('deposit complete', args)).catch(console.error)
  }

  // use existing unlock button in currency input panel to approve tokens
  // use transfer states to decide tokens
  const inputPanelProps = {
    extraTextClickHander: () => balances.update(),
    selectedTokenAddress: selectedToken,
    selectModalProps: { enableCreateExchange: true },
    onCurrencySelected: handleSelectToken,
  }
  return (
    <>
      <OversizedPanel hideTop>
        <TransferTypeSelection onClick={() => setModalOpen(true)}>
          {transferTypeNames[transferType]}
          <ColoredDropdown alt={'arrow down'} />
        </TransferTypeSelection>
        <Modal isOpen={modalOpen} onDismiss={() => { setModalOpen(false) }}>
          <TransferTypeModal>
            {[TransferType.toArb, TransferType.fromArb].map(ttype => (
              <ModalOption
                key={ttype}
                onClick={(...args) => {
                  console.log('select modal args', args)
                  setTransferType(ttype)
                  setModalOpen(false)
                }}
                className={ttype === transferType ? 'active' : undefined}
              >
                {translated(transferTypeNames[ttype])}
              </ModalOption>
            ))}
          </TransferTypeModal>
        </Modal>
      </OversizedPanel>

      <CurrencyInputPanel
        title={translated('input')}
        allBalances={combinedEthDetails}
        allTokens={combinedEthDetails}
        extraText={'Balance: ' + amountFormatter(combinedEthDetails[selectedToken].balance, 18, 4)}
        onValueChange={setTransferValue}
        {...inputPanelProps}
      // description={"Ethereum balance"}
      // errorMessage={inputError}
      // disableTokenSelect // maybe cleaner to have own input for adding tokens
      />

      <OversizedPanel>
        <DownArrowBackground>
          {/* could do a cool loading animation here modulating `active` */}
          <DownArrow active={true} alt="arrow" />
        </DownArrowBackground>
      </OversizedPanel>

      <CurrencyInputPanel
        title={translated('output')}
        allBalances={combinedArbDetails}
        allTokens={combinedArbDetails}
        extraText={'Balance: ' + amountFormatter(combinedArbDetails[selectedToken].balance, 18, 4)}
        value={transferValue}
        disableTokenSelect
        {...inputPanelProps}
      // description={'output description'}
      // errorMessage={inputError}
      />

      <ButtonContainer>
        <Button
          // disabled={!isValid || customSlippageError === 'invalid'}
          onClick={handleButtonClick}
        // warning={highSlippageWarning || customSlippageError === 'warning'}
        >
          {/* text should provide destination context */}
          {translated('Transfer to Arbitrum Wallet')}
        </Button>
      </ButtonContainer>
    </>
  )
}