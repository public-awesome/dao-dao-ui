import dynamic from 'next/dynamic'
import {
  FormEvent,
  FormEventHandler,
  useReducer,
  ChangeEvent,
  useState,
} from 'react'
import { CosmosMsgFor_Empty_1 } from 'types/cw3'
import { isValidAddress } from 'util/isValidAddress'
import { ProposalMessageType } from '../models/proposal/messageMap'
import { EmptyProposal, Proposal } from '../models/proposal/proposal'
import {
  ProposalAction,
  ProposalRemoveMessage,
} from '../models/proposal/proposalActions'
import { ProposalReducer } from '../models/proposal/proposalReducer'
import {
  getActiveMessageId,
  getMessage,
  proposalMessages,
  topmostId,
} from '../models/proposal/proposalSelectors'
import { labelForMessage, makeSpendMessage } from '../util/messagehelpers'
import LineAlert from './LineAlert'
import { MessageSelector } from './MessageSelector'
import SpendEditor from './SpendEditor'

let _editedJSON: any = undefined

export function ProposalEditor({
  initialProposal,
  loading,
  error,
  onProposal,
  contractAddress,
  recipientAddress,
}: {
  initialProposal?: Proposal
  loading?: boolean
  error?: string
  onProposal: (proposal: Proposal) => void
  contractAddress: string
  recipientAddress: string
}) {
  const [proposal, dispatch] = useReducer(ProposalReducer, {
    ...(initialProposal || EmptyProposal),
  })
  const [editingJson, setEditingJson] = useState<boolean>(false)
  let activeId = getActiveMessageId(proposal)
  const activeMessage = activeId ? getMessage(proposal, activeId) : undefined

  const messageActions = [
    {
      label: 'Spend',
      id: 'spend',
      action: () => addMessage(ProposalMessageType.Spend),
      href: '#',
      enabled: () => true,
    },
    {
      label: 'Custom',
      id: 'custom',
      action: () => addMessage(ProposalMessageType.Custom),
      href: '#',
      enabled: () => true,
    },
    {
      label: 'Mint',
      id: 'mint',
      action: () => addMessage(ProposalMessageType.Mint),
      href: '#',
      enabled: () => false,
    },
    {
      label: 'Text',
      id: 'text',
      action: () => addMessage(ProposalMessageType.Text),
      href: '#',
      enabled: () => false,
    },
    {
      label: 'Collect',
      id: 'collect',
      action: () => addMessage(ProposalMessageType.Collect),
      href: '#',
      enabled: () => false,
    },
  ]

  let modeEditor = null

  const handleCustomMessageChange = (json: any) => {
    let action: ProposalAction | undefined
    if (activeId) {
      action = {
        type: 'updateMessage',
        id: activeId,
        message: json,
        valid: true,
      }
    } else if (activeMessage) {
      action = {
        type: 'addMessage',
        messageType: ProposalMessageType.Custom,
        message: json,
        valid: true,
      }
    }
    if (action) {
      dispatch(action)
    }
  }

  switch (activeMessage?.messageType) {
    case ProposalMessageType.Spend:
      let amount = ''
      if (activeMessage?.message) {
        amount = (activeMessage.message as any).bank?.send?.amount[0]?.amount
      }
      modeEditor = (
        <SpendEditor
          dispatch={dispatch}
          spendMsg={activeMessage}
          contractAddress={contractAddress}
          initialRecipientAddress={recipientAddress}
        ></SpendEditor>
      )
      break
    case ProposalMessageType.Custom:
      {
        if (editingJson) {
          const JSONMessageEditor = dynamic(
            async () => {
              const mod = await import('./JsonMessageEditor')
              return mod.JSONMessageEditor
            },
            { ssr: false }
          )

          function handleJsonChange(json: any) {
            _editedJSON = json
          }

          modeEditor = (
            <div>
              <button
                className="btn"
                onClick={(e) => {
                  e.preventDefault()
                  handleCustomMessageChange(_editedJSON)
                  setEditingJson(false)
                }}
              >
                Done
              </button>
              <JSONMessageEditor
                json={activeMessage?.message}
                onJsonChange={handleJsonChange}
              ></JSONMessageEditor>
            </div>
          )
        } else {
          modeEditor = (
            <div>
              <button
                className="btn"
                onClick={(e) => {
                  e.preventDefault()
                  setEditingJson(true)
                }}
              >
                Edit
              </button>
              <div>{JSON.stringify(activeMessage?.message, null, 2)}</div>
            </div>
          )
        }
      }
      break
  }

  const complete = false

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e: FormEvent) => {
    e.preventDefault()
    onProposal(proposal)
  }

  function setProposalTitle(title: string) {
    dispatch({ type: 'setTitle', title })
  }

  function setProposalDescription(description: string) {
    dispatch({ type: 'setDescription', description })
  }

  let messages = proposalMessages(proposal).map((mapEntry) => {
    const label = labelForMessage(mapEntry.message)

    let brightness = ' opacity-50'
    if (mapEntry.id === activeId) {
      brightness = ''
    }
    let className = `flex flex-row m-2`
    return (
      <li
        className={className}
        key={mapEntry.id}
        onClick={() =>
          dispatch({
            type: 'setActiveMessage',
            id: mapEntry.id,
          })
        }
      >
        <div
          title={label}
          className={`w-48 whitespace-nowrap text-left truncate${brightness}`}
        >
          {label}
        </div>
        <button
          onClick={() => removeMessage(mapEntry.id)}
          className="btn btn-circle btn-xs"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-4 h-4 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </li>
    )
  })

  const addMessage = (messageType: ProposalMessageType) => {
    if (messageType === ProposalMessageType.Spend) {
      addSpendMessage()
    } else if (messageType === ProposalMessageType.Custom) {
      addCustomMessage()
    }
  }

  const addCustomMessage = () => {
    const action: ProposalAction = {
      type: 'addMessage',
      message: { custom: {} } as CosmosMsgFor_Empty_1,
      messageType: ProposalMessageType.Custom,
      label: `Custom ${messages?.length || 0}`,
      valid: true,
    }
    dispatch(action)
  }

  const addSpendMessage = () => {
    const validAddress = !!(
      recipientAddress && isValidAddress(recipientAddress)
    )
    if (validAddress) {
      try {
        const message = makeSpendMessage('', recipientAddress, contractAddress)
        const messageType = ProposalMessageType.Spend
        const action: ProposalAction = {
          type: 'addMessage',
          message,
          messageType,
          valid: true,
        }
        dispatch(action)
      } catch (e) {
        console.error(e)
      }
    }
  }

  const removeMessage = (messageId: string) => {
    const removeMessageAction: ProposalRemoveMessage = {
      type: 'removeMessage',
      id: messageId,
    }
    dispatch(removeMessageAction)
  }

  return (
    <div className="flex flex-col w-full flex-row">
      <div className="grid bg-base-100">
        <div className="flex">
          <aside id="message-nav" className="w-52 m-4">
            <label htmlFor="message-list">Messages</label>
            <MessageSelector actions={messageActions}></MessageSelector>
            <ul id="message-list">{messages}</ul>
          </aside>
          <form className="text-left container mx-auto" onSubmit={handleSubmit}>
            <h1 className="text-4xl my-8 text-bold">Create Proposal</h1>
            <label className="block">Title</label>
            <input
              className="input input-bordered rounded box-border p-3 w-full focus:input-primary text-xl"
              name="label"
              onChange={(e) => setProposalTitle(e?.target?.value)}
              readOnly={complete}
            />
            <label className="block mt-4">Description</label>
            <textarea
              className="input input-bordered rounded box-border p-3 h-24 w-full focus:input-primary text-xl"
              name="description"
              onChange={(e) => setProposalDescription(e?.target?.value)}
              readOnly={complete}
            />
            <h2>
              {labelForMessage(activeMessage?.message, 'Current Message')}
            </h2>
            {modeEditor}
            {!complete && (
              <button
                className={`btn btn-primary text-lg mt-8 ml-auto ${
                  loading ? 'loading' : ''
                }`}
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                type="submit"
                disabled={loading}
              >
                Create Proposal
              </button>
            )}
            {error && (
              <div className="mt-8">
                <LineAlert variant="error" msg={error} />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProposalEditor
