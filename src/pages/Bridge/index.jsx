import React, { useState, useEffect } from 'react'
import { useWeb3Context } from 'web3-react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useArbTokenBridge, TokenType } from 'arb-token-bridge/dist/hooks/useArbTokenBridge'
import { ethers } from 'ethers'
import { lighten, darken } from 'polished'
import Tooltip from '@reach/tooltip'
import '@reach/tooltip/styles.css'

import Circle from '../../assets/images/circle.svg'
import { ReactComponent as QuestionMark } from '../../assets/images/question.svg'
import { Button, Spinner } from '../../theme'
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

const LockboxContainer = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  padding: 1rem 0;
`

const LockboxBalance = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  color: ${({ theme }) => theme.doveGray};
  font-size: 0.75rem;
  padding: 0.25rem 1rem 0;
  justify-content: space-between;
`

const WithdrawLockBoxBtn = styled.span`
  &:hover {
    color: ${({ theme }) => theme.royalBlue};
    cursor: pointer;
  }
`

const CurrencyInputDescription = styled.span`
  color: ${({ theme }) => darken(0.2, theme.doveGray)} !important;
  &:hover {
    cursor: initial !important;
  }
`

const StyledQuestionMark = styled(QuestionMark)`
  padding-left: 0.5rem;
`

// TODO symbol image search overrides for each symbol if possible
// TODO create exchange when adding token?
const TransferType = {
  toArb: 1,
  fromArb: 2,
}

const ETH_TOKEN = 'ETH'

// TODO display full rollup address somewhere
// TODO disable input if not unlocked, remove auto approve on transfer above
// TODO transaction error handling
export default function Bridge({ params = defaultBridgeParams }) {
  const [transferType, setTransferType] = useState(TransferType.toArb)
  const [transferValue, setTransferValue] = useState('0.0')
  const [selectedToken, setToken] = useState(ETH_TOKEN)
  const [modalOpen, setModalOpen] = useState(false)
  const [isLoading, setLoading] = useState(false)

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
      decimals: token.decimals,
      balance: balances.erc20[addr].balance,
      ethRate: ethers.constants.One,
      exchangeAddress: null,
    }
    combinedArbDetails[addr] = {
      ...combinedEthDetails[addr],
      balance: balances.erc20[addr].arbChainBalance,
    }
  }

  const handleInput = (value) => {
    if (!isLoading) {
      setTransferValue(value)
    }
  }

  const handleSelectToken = (address) => {
    let maybePromise
    if (address !== ETH_TOKEN && !bridgeTokens[address]) {
      maybePromise = bridge.token.add(address, TokenType.ERC20)
    }

    return Promise.resolve(maybePromise).then(() => setToken(address))
  }

  const handleButtonClick = async () => {
    setLoading(true)

    try {
      switch (transferType) {
        case TransferType.toArb:
          if (selectedToken === ETH_TOKEN) {
            await bridge.eth.deposit(transferValue)
          } else {
            if (!bridgeTokens[selectedToken].allowed) {
              await bridge.token.approve(selectedToken)
            }
            await bridge.token.deposit(selectedToken, transferValue)
          }
          break
        case TransferType.fromArb:
          if (selectedToken === ETH_TOKEN) {
            await bridge.eth.withdraw(transferValue)
          } else {
            await bridge.token.withdraw(selectedToken, transferValue)
          }
          break
        default:
          throw new Error('unhandled transfer type', transferType)
      }
      setTransferValue('0')
    } catch (e) {
      throw new Error('failed to execute transfer', e)
    } finally {
      setLoading(false)
    }
  }

  const displayLockboxBalance = () => {
    let balance
    if (selectedToken === ETH_TOKEN) {
      balance = ethers.utils.formatEther(balances.eth.lockBoxBalance)
    } else {
      balance = amountFormatter(balances.erc20[selectedToken].lockBoxBalance, combinedEthDetails[selectedToken].decimals, 4)
    }
    return `${balance} ${combinedEthDetails[selectedToken].symbol}`
  }

  const withdrawLockbox = async () => {
    setLoading(true)
    if (selectedToken === ETH_TOKEN) {
      await bridge.eth.withdrawLockBox()
    } else {
      await bridge.token.withdrawLockBox(selectedToken)
    }
    setLoading(false)
  }

  const inputPanelProps = {
    selectedTokenAddress: selectedToken,
    selectModalProps: { enableCreateExchange: true },
    onCurrencySelected: handleSelectToken,
    value: transferValue
  }

  const [
    inputName,
    inputDetails,
    outputName,
  ] = transferType === TransferType.toArb ?
      ['Ethereum', combinedEthDetails, 'Arbitrum']
      : ['Arbitrum', combinedArbDetails, 'Ethereum']
  const inputBalanceFormatted = amountFormatter(inputDetails[selectedToken].balance, inputDetails[selectedToken].decimals, 4)

  const showInputUnlock = transferType === TransferType.toArb &&
    selectedToken !== ETH_TOKEN &&
    !bridgeTokens[selectedToken].allowed

  return (
    <>
      <OversizedPanel hideTop>
        <TransferTypeSelection onClick={() => setModalOpen(true)}>
          {transferTypeNames[transferType]}
          <ColoredDropdown alt={'arrow down'} />
        </TransferTypeSelection>
        <Modal isOpen={modalOpen} onDismiss={() => { setModalOpen(false) }}>
          <TransferTypeModal>
            {Object.values(TransferType).map(ttype => (
              <ModalOption
                key={ttype}
                onClick={() => {
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

      <OversizedPanel hideTop>
        <LockboxContainer>
          <LockboxBalance>
            <span>Lockbox balance: {displayLockboxBalance()}</span>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <WithdrawLockBoxBtn
                onClick={() => withdrawLockbox()}
                children={isLoading ?
                  <Spinner src={Circle} alt={'Loading...'} /> :
                  'Withdraw'
                }
              />
              <Tooltip
                label={<span>When withdrawing tokens from an Arbitrum Rollup, they are held in a smart contract lock box.</span>}
                style={{
                  background: 'hsla(0, 0%, 0%, 0.75)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '0.5em 1em',
                  marginTop: '-64px',
                  marginLeft: '48px',
                  maxWidth: '150px',
                  whiteSpace: 'normal'
                }}
              >
                <StyledQuestionMark />
              </Tooltip>
            </span>
          </LockboxBalance>
        </LockboxContainer>
      </OversizedPanel>

      <CurrencyInputPanel
        title={translated('input')}
        description={<CurrencyInputDescription children={`from ${inputName}`} />}
        allBalances={inputDetails}
        allTokens={inputDetails}
        extraText={`Balance: ${inputBalanceFormatted}`}
        extraTextClickHander={() => setTransferValue(inputBalanceFormatted)}
        onValueChange={handleInput}
        showUnlock={showInputUnlock} // only unlock for eth side balances
        {...inputPanelProps}
      // errorMessage={inputError}
      />

      <OversizedPanel hideBottom>
        <DownArrowBackground>
          <DownArrow
            active={isLoading}
            clickable
            onClick={() => {
              const next = transferType === TransferType.toArb ?
                TransferType.fromArb :
                TransferType.toArb
              setTransferType(next)
            }} alt="arrow" />
        </DownArrowBackground>
      </OversizedPanel>

      <ButtonContainer>
        <Button
          disabled={isLoading}
          onClick={handleButtonClick}
        // warning={highSlippageWarning || customSlippageError === 'warning'}
        >
          {/* text should provide destination context */}
          {isLoading ?
            <Spinner src={Circle} alt={'Loading...'} /> :
            translated(`Transfer to ${outputName} Wallet`)
          }
        </Button>
      </ButtonContainer>
    </>
  )
}