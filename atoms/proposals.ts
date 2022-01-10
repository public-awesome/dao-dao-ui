import { Proposal, ProposalResponse } from '@dao-dao/types/contracts/cw3-dao'
import { atom, atomFamily, selectorFamily, AtomEffect } from 'recoil'
import { ContractProposalMap, ProposalKey, ProposalMap, ProposalMapItem } from 'types/proposals'

export function makeProposalKeyString({
  contractAddress,
  proposalId,
}: ProposalKey): string {
  return `${contractAddress},${proposalId}`
}

export function parseProposalKeyString(
  keyString: string
): ProposalKey | undefined {
  const [contractAddress, proposalIdString] = keyString.split(',')
  const proposalId = parseInt(proposalIdString ?? '-1', 10)
  return {
    contractAddress,
    proposalId,
  }
}

export function draftProposalItem(
  proposal: Proposal,
  id: number
): ProposalMapItem {
  return {
    proposal,
    id,
    draft: true,
  }
}

export function nondraftProposalItem(
  proposal: ProposalResponse
): ProposalMapItem {
  return {
    proposal,
    id: proposal.id,
    draft: false,
  }
}

const localStorageEffect: <T>(key: string) => AtomEffect<T> =
  (key) =>
  ({ setSelf, onSet, node }) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
      const json = JSON.parse(savedValue)
      setSelf(json)
    }

    onSet((newValue: any, _: any, isReset: boolean) => {
      if (isReset) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(newValue))
      }
    })
  }

export const proposalsRequestIdAtom = atom<number>({
  key: 'proposalsRequestId',
  default: 0,
})

export const proposalsRequestStartBeforeAtom = atom<number>({
  key: 'proposalsRequestStartBefore',
  default: 0,
})

export const proposalListAtom = atom<ProposalResponse[]>({
  key: 'proposalList',
  default: [],
})

// The number of proposals that have been created since we updated the
// proposal listing.
export const proposalsCreatedAtom = atom<number>({
  key: 'proposalsCreatedAtom',
  default: 0,
})

export const nextDraftProposalIdAtom = atom<number>({
  key: 'nextDraftProposalId',
  default: 10000,
  effects_UNSTABLE: [localStorageEffect<number>('nextDraftProposalId')],
})

export const contractProposalMapAtom = atom<ContractProposalMap>({
  key: 'contractProposalMap',
  default: {},
  effects_UNSTABLE: [
    localStorageEffect<ContractProposalMap>('contractProposalMap'),
  ],
})

export const proposalMapAtom = atomFamily({
  key: 'proposalMap',
  default: selectorFamily({
    key: 'ProposalMapDefault',
    get:
      (contractAddress: string) =>
      ({ get }) => {
        const proposals = get(contractProposalMapAtom)
        return proposals[contractAddress]
      },
  }),
  effects_UNSTABLE: [localStorageEffect<ProposalMap>('proposalMap')],
})

export const draftProposalAtom = atomFamily<ProposalMapItem | undefined, ProposalKey>({
  key: 'draftProposal',
  default: selectorFamily({
    key: 'draftProposalDefault',
    get:
      ({contractAddress, proposalId}) =>
      ({ get }) => {
        const draftProposals = get(proposalMapAtom(contractAddress))
        return draftProposals ? draftProposals[proposalId] : undefined
      },
  }),
})

