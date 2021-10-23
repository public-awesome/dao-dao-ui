import { MessageAction } from '../util/messagehelpers'
import { ChangeEvent } from 'react'

export function MessageSelector({ actions }: { actions: MessageAction[] }) {
  const items = actions.map((action, i: number) => {
    let item
    if (action.enabled()) {
      item = (
        <a href={action.href} onClick={action.action}>
          {action.label}
        </a>
      )
    } else {
      item = <a href="#">{action.label}</a>
    }
    return (
      <option disabled={!action.enabled()} value={i} key={i}>
        {action.label}
      </option>
    )
  })

  const handleItemSelected = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!e.target) {
      return
    }
    const i = e.target.selectedIndex - 1
    const action = i >= 0 && actions?.length > i ? actions[i] : undefined
    if (action) {
      action.action()
    }
  }

  return (
    <select
      className="select select-bordered w-full max-w-xs"
      onChange={handleItemSelected}
      value={-1}
    >
      <option disabled={false}>Add Message...</option>
      {items}
    </select>
  )
}
