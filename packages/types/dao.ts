import { TFunction } from 'next-i18next'
import { ComponentType } from 'react'
import {
  FieldError,
  FieldErrors,
  FieldPath,
  FieldPathValue,
  FieldValues,
  FormState,
  UseFormRegister,
  UseFormReturn,
  UseFormSetValue,
} from 'react-hook-form'

import { Validator } from './chain'
import {
  InstantiateMsg,
  ModuleInstantiateInfo,
} from './contracts/cw-core-0.2.0'
import { ProposalModuleAdapter } from './proposal-module-adapter'
import { LoadingData } from './ui'
import { VotingModuleAdapter } from './voting-module-adapter'

export interface DaoDisplayInfo {
  coreAddress: string
  name: string
  description: string
  imageUrl?: string
  established?: Date
  href: string

  parentDao?: DaoDisplayInfo
}

export interface DaoCardInfoLazyData {
  isMember: boolean
  tokenBalance: number
  tokenSymbol: string
  proposalCount: number
}

export interface DaoCardInfo extends Omit<DaoDisplayInfo, 'parentDao'> {
  // Only need a few properties.
  parentDao?: Pick<DaoDisplayInfo, 'coreAddress' | 'imageUrl' | 'href'>

  lazyData: LoadingData<DaoCardInfoLazyData>
}

export enum UnstakingTaskStatus {
  Unstaking = 'unstaking',
  ReadyToClaim = 'readyToClaim',
  Claimed = 'claimed',
}

export interface UnstakingTask {
  status: UnstakingTaskStatus
  amount: number
  tokenSymbol: string
  tokenDecimals: number
  // If unstaking or ready to claim, date it will be/was unstaked.
  // If claimed, date it was claimed.
  date?: Date
}

export interface TokenStake {
  validator: Validator
  amount: number
  rewards: number
}

export interface TokenCardStakingInfo {
  unstakingTasks: UnstakingTask[]
  unstakingDurationSeconds: number | undefined
  stakes: TokenStake[]
}

export interface TokenCardInfo {
  crown?: boolean
  tokenSymbol: string
  tokenDecimals: number
  subtitle?: string
  imageUrl: string
  unstakedBalance: number
  usdcUnitPrice: number
  // Defined if this is a Cw20 token.
  cw20Address?: string

  stakingInfo?: TokenCardStakingInfo
}

export interface NftCardInfo {
  address: string
  externalLink?: {
    href: string
    name: string
  }
  imageUrl?: string
  createdBy: string
  floorPrice?: {
    amount: number
    denom: string
  }
  name: string
}

export interface ProposalModule {
  contractName: string
  address: string
  prefix: string
}

//! Create DAO

export type CreateDaoCustomValidator = (setNewErrors: boolean) => void

export interface CreateDaoContext<
  VotingModuleAdapterModuleData extends FieldValues = any
> {
  form: UseFormReturn<NewDao<VotingModuleAdapterModuleData>>
  availableVotingModuleAdapters: Pick<
    Required<VotingModuleAdapter>,
    'id' | 'daoCreation'
  >[]
  votingModuleDaoCreationAdapter: Required<VotingModuleAdapter>['daoCreation']
  proposalModuleDaoCreationAdapters: Required<ProposalModuleAdapter>['daoCreation'][]
  generateInstantiateMsg: () => InstantiateMsg
  setCustomValidator: (fn: CreateDaoCustomValidator) => void
}

export interface NewDao<VotingModuleAdapterData extends FieldValues = any> {
  name: string
  description: string
  imageUrl?: string
  votingModuleAdapter: {
    id: string
    data: VotingModuleAdapterData
  }
  proposalModuleAdapters: {
    id: string
    data: any
  }[]
  advancedVotingConfigEnabled: boolean
}

export interface NewDaoTier {
  name: string
  weight: number
  members: NewDaoTierMember[]
  // For custom errors.
  _error?: undefined
}

export interface NewDaoTierMember {
  address: string
}

export interface DaoCreationGovernanceConfigInputProps<
  VotingModuleAdapterData extends FieldValues = any
> {
  data: VotingModuleAdapterData
  // Used within a voting module adapter, so it's safe to apply the data
  // generic.
  context: CreateDaoContext<VotingModuleAdapterData>
}

export interface DaoCreationGovernanceConfigReviewProps<
  VotingModuleAdapterData extends FieldValues = any
> {
  // Used within a voting module adapter, so it's safe to apply the data
  // generic.
  newDao: NewDao<VotingModuleAdapterData>
  data: VotingModuleAdapterData
}

export interface DaoCreationVotingConfigItemInputProps<
  ModuleData extends FieldValues = any
> {
  // Used within voting and proposal module adapters, so the data generic passed
  // in may not necessarily be the voting module adapter data. Must use `any`.
  newDao: NewDao<any>
  data: ModuleData
  register: UseFormRegister<ModuleData>
  setValue: UseFormSetValue<ModuleData>
  watch: <TFieldName extends FieldPath<ModuleData>>(
    name: TFieldName,
    defaultValue?: FieldPathValue<ModuleData, TFieldName>
  ) => FieldPathValue<ModuleData, TFieldName>
  errors?: FormState<ModuleData>['errors']
}

export interface DaoCreationVotingConfigItemReviewProps<
  ModuleData extends FieldValues = any
> {
  // Used within voting and proposal module adapters, so the data generic passed
  // in may not necessarily be the voting module adapter data. Must use `any`.
  newDao: NewDao<any>
  data: ModuleData
}

export interface DaoCreationVotingConfigItem<
  ModuleData extends FieldValues = any
> {
  // Used within voting and proposal module adapters, so the data generic passed
  // in may not necessarily be the voting module adapter data. Must use `any`.
  onlyDisplayCondition?: (newDao: NewDao<any>) => boolean
  Icon: ComponentType
  nameI18nKey: string
  descriptionI18nKey: string
  tooltipI18nKey?: string
  Input: ComponentType<DaoCreationVotingConfigItemInputProps<ModuleData>>
  getInputError: (errors?: FieldErrors<ModuleData>) => FieldError | undefined
  Review: ComponentType<DaoCreationVotingConfigItemReviewProps<ModuleData>>
  getReviewClassName?: (data: ModuleData) => string
}

export type DaoCreationGetInstantiateInfo<
  ModuleData extends FieldValues = any
> = (
  // Used within voting and proposal module adapters, so the data generic passed
  // in may not necessarily be the voting module adapter data. Must use `any`.
  newDao: NewDao<any>,
  data: ModuleData,
  t: TFunction
) => ModuleInstantiateInfo
