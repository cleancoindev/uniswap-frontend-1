import React from 'react'
import styled from 'styled-components'

import { Link } from '../../theme'
import Web3Status from '../Web3Status'
import { darken } from 'polished'
import { slide as MobileMenu } from 'react-burger-menu'

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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

const Title = styled.div`
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

  /* CSS that follows accomodates mobile menu as necessary*/
  .bm-burger-button {
    display: none;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    .bm-burger-button {
      display: initial;
    }

    .link {
      display: block;
    }

    .unicorn {
      display: none;
    }
  `}
`

const DefaultMenu = styled.div`
  display: flex;

  .unicorn {
    padding-right: 10px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`

const Divider = styled.span`
  display: initial;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`

const MobileTitle = styled.div`
  display: none;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: initial;
    position: relative;
    left: 300%; /* offset needed to center */
  `}
`

const menuStyles = {
  bmBurgerButton: {
    position: 'fixed',
    width: '36px',
    height: '30px',
    left: '6vw',
    top: '20px'
  },
  bmBurgerBars: {
    background: '#36454f'
  },
  // bmBurgerBarsHover: {
  //   background: '#a90000'
  // },
  // bmCrossButton: {
  //   height: '24px',
  //   width: '24px',
  // },
  // bmCross: {
  //   background: '#bdc3c7'
  // },
  bmMenuWrap: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%'
  },
  bmMenu: {
    background: '#373a47',
    padding: '2.5em 1.5em 0',
    fontSize: '1.15em'
  },
  // bmMorphShape: {
  //   fill: '#373a47'
  // },
  // bmItemList: {
  //   color: '#b8b7ad',
  //   padding: '0.8em'
  // },
  // bmItem: {
  //   display: 'inline-block'
  // },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)',
    position: 'absolute',
    top: 0,
    left: 0
  }
}

const noddingUnicorn = (
  <Nod className={'unicorn'}>
    <Link className={'link'} href="https://uniswap.io">
      <span role="img" aria-label="unicorn" children={'🦄'} />
    </Link>
  </Nod>
)

const menuLinks = (
  <>
    {noddingUnicorn}
    <Divider children={'|'} />
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
  </>
)

export default function Header() {
  return (
    <HeaderFrame>
      <HeaderElement>
        <Title>
          <MobileMenu styles={menuStyles} children={menuLinks} />
          <DefaultMenu children={menuLinks} />
        </Title>
      </HeaderElement>
      <HeaderElement>
        <MobileTitle>{noddingUnicorn}</MobileTitle>
      </HeaderElement>
      <HeaderElement>
        <Web3Status />
      </HeaderElement>
    </HeaderFrame>
  )
}
