import React from 'react'
import styled from 'styled-components'

import { Link } from '../../theme'
import Web3Status from '../Web3Status'
import { darken } from 'polished'

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  /* .links {
    display: flex;
  } */

  /* ${({ theme }) => theme.mediaWidth.upToMedium`
    .links {
      display: block;
    }
  `} */
`

const HeaderElement = styled.div`
  margin: 1.25rem;
`

const Nod = styled.span`
  transform: rotate(0deg);
  transition: transform 150ms ease-out;

  :hover {
    transform: rotate(-10deg);
  }
`

const Menu = styled.div`
  .links {
    display: flex;
  }

  .link:hover {
    cursor: pointer;
  }

  #title {
    display: inline;
    margin: 0 1vw;
    font-size: 1rem;
    font-weight: 500;
    color: ${({ theme }) => theme.wisteriaPurple};
    :hover {
      color: ${({ theme }) => darken(0.1, theme.wisteriaPurple)};
    }
  }

  input#menu-check,
  label[for='menu-check'] {
    display: none;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    label[for=menu-check] {
      display: initial;
      cursor: pointer;
      user-select: none;
    }

    .link {
      display: block;
      text-align: left;
    }

    .links {
      display: block;
      max-height: 0;
      overflow: hidden;
    }

    input:checked ~ .links {
      max-height: 100%;
    }

    .menu-toggle {
      display: initial;
    }

  `}
`

const Divider = styled.span`
  display: initial;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`

export default function Header() {
  return (
    <HeaderFrame>
      <HeaderElement>
        <Menu>
          <input type={'checkbox'} id={'menu-check'} />
          <label for="menu-check" children={'TODO Menu Icon'} />
          <div className={'links'}>
            <Nod>
              <Link className={'link'} href="https://uniswap.io">
                <span role="img" aria-label="unicorn" children={'🦄'} />
              </Link>
            </Nod>
            <Link className={'link'} href="https://developer.offchainlabs.com">
              <h1 id="title">Uniswap on Arbitrum</h1>
            </Link>
            <Divider children={'|'} />
            <Link className={'link'} href="http://uniswap-demo.offchainlabs.com/tokenbridge">
              <h1 id="title">Token Bridge</h1>
            </Link>
            <Divider children={'|'} />
            <Link className={'link'} href="https://developer.offchainlabs.com">
              <h1 id="title">Arbitrum Documentation</h1>
            </Link>
          </div>
        </Menu>
      </HeaderElement>
      <HeaderElement>
        <Web3Status />
      </HeaderElement>
    </HeaderFrame>
  )
}
