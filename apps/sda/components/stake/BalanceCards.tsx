import { FunctionComponent } from 'react'

import { useWallet } from '@dao-dao/state'
import { Button } from '@dao-dao/ui'
import { convertMicroDenomToDenomWithDecimals } from '@dao-dao/utils'

import { Loader } from '../Loader'
import { Logo } from '../Logo'
import { useGovernanceTokenInfo, useStakingInfo } from '@/hooks'

interface CardProps {
  setShowStakingMode: () => void
}

export const UnstakedBalanceCard: FunctionComponent<CardProps> = ({
  setShowStakingMode,
}) => {
  const { connected } = useWallet()
  const {
    governanceTokenInfo,
    walletBalance: _unstakedBalance,
    price,
  } = useGovernanceTokenInfo({
    fetchWalletBalance: true,
    fetchPriceInfo: true,
  })

  if (!governanceTokenInfo || (connected && _unstakedBalance === undefined)) {
    return <BalanceCardLoader />
  }

  const unstakedBalance = convertMicroDenomToDenomWithDecimals(
    _unstakedBalance ?? 0,
    governanceTokenInfo.decimals
  )

  return (
    <>
      <div className="flex flex-row gap-2 items-center mb-4">
        <Logo size={20} />
        <p className="text-base">
          {unstakedBalance.toLocaleString(undefined, {
            maximumFractionDigits: governanceTokenInfo.decimals,
          })}{' '}
          {governanceTokenInfo.name}
        </p>
      </div>

      <div className="flex flex-row flex-wrap justify-between items-center">
        {price && (
          <p className="text-lg font-medium">
            ${' '}
            {(unstakedBalance * price).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{' '}
            USD
          </p>
        )}

        <Button
          className="text-base"
          disabled={!connected}
          onClick={setShowStakingMode}
          variant="secondary"
        >
          Manage
        </Button>
      </div>
    </>
  )
}

export const StakedBalanceCard: FunctionComponent<CardProps> = ({
  setShowStakingMode,
}) => {
  const { connected } = useWallet()
  const { governanceTokenInfo, price } = useGovernanceTokenInfo({
    fetchPriceInfo: true,
  })
  const { totalStakedValue: totalStakedValue, walletBalance: _stakedBalance } =
    useStakingInfo({
      fetchTotalStakedValue: true,
      fetchWalletBalance: true,
    })

  if (
    !governanceTokenInfo ||
    totalStakedValue === undefined ||
    (connected && _stakedBalance === undefined)
  ) {
    return <BalanceCardLoader />
  }

  const votingPower =
    totalStakedValue === 0
      ? 0
      : ((_stakedBalance ?? 0) / totalStakedValue) * 100

  const stakedBalance = convertMicroDenomToDenomWithDecimals(
    _stakedBalance ?? 0,
    governanceTokenInfo.decimals
  )

  return (
    <>
      <div className="flex flex-row justify-between items-center mb-4">
        <div className="flex flex-row gap-2 items-center">
          <Logo size={20} />
          <p className="text-base">
            {stakedBalance.toLocaleString(undefined, {
              maximumFractionDigits: governanceTokenInfo.decimals,
            })}{' '}
            {governanceTokenInfo.name}
          </p>
        </div>

        <p className="text-base text-secondary">
          {votingPower.toLocaleString(undefined, {
            maximumSignificantDigits: 4,
          })}
          % <span className="text-xs text-tertiary">of all voting power</span>
        </p>
      </div>

      <div className="flex flex-row flex-wrap justify-between items-center">
        {price && (
          <p className="text-lg font-medium">
            ${' '}
            {(stakedBalance * price).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{' '}
            USD
          </p>
        )}

        <Button
          className="text-base"
          disabled={!connected}
          onClick={setShowStakingMode}
          variant="secondary"
        >
          Manage
        </Button>
      </div>
    </>
  )
}

export const BalanceCardLoader = () => (
  <div className="h-[5.25rem]">
    <Loader />
  </div>
)