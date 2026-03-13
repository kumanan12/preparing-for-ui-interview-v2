import { useEffect, useRef, useState } from 'react'
import css from './typeahead.module.css'
import flex from '@course/styles'
import cx from '@course/cx'
import { Trie } from './trie'

export type TTypeaheadEntry<T> = {
  query: string
  id: string
  value: T
}

type TTypeaheadProps<T> = {
  id?: string
  entries?: TTypeaheadEntry<T>[]
  onQuery: (query: string, signal?: AbortSignal) => Promise<TTypeaheadEntry<T>[]>
  itemRender: (item: TTypeaheadEntry<T>) => React.ReactNode
}

/**
 * Expected usage:
 * <Typeahead
 *   onQuery={async (query, signal) => fetch(`/api/search?q=${query}`, { signal }).then(r => r.json())}
 *   itemRender={(item) => <div>{item.query}</div>}
 * />
 */
const DEFAULT: TTypeaheadEntry<any>[] = []

export function Typeahead<T>({
  id = 'typeahead',
  entries = DEFAULT,
  onQuery,
  itemRender,
}: TTypeaheadProps<T>) {
  // Step 1: State — query, items, isLoading, isVisible + trieRef for prefix-based caching
  const [query, setQuery] = useState<string>('')
  const [isLoading, setLoading] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const trie = useRef<Trie<TTypeaheadEntry<T>>>(new Trie<TTypeaheadEntry<T>>())

  // Helper: insert all entries into the trie for prefix search caching
  function insertAll(entries: TTypeaheadEntry<T>[]) {
    for (const entry of entries) {
      trie.current?.insert?.(entry.query, entry)
    }
  }

  // Step 2: Input change handler — update query, show dropdown, fetch results
  // Note: no AbortController here — component user can debounce onQuery externally
  const onQueryChange: React.ChangeEventHandler = ({ target }) => {
    if (target instanceof HTMLInputElement) {
      const query = target.value
      setQuery(query)
      setLoading(true)
      setIsVisible(true)
      onQuery(query)
        .then(insertAll, (error) => {
          throw error
        })
        .finally(() => setLoading(false))
    }
  }

  // Step 3: Keyboard handler — Enter/Space to select item, Escape to close
  // Uses data-item attribute on <li> elements for delegation
  const onKeyDown: React.KeyboardEventHandler = ({ target, key }) => {
    if (target instanceof HTMLElement && target.dataset.item) {
      if (key === 'Enter' || key === ' ') {
        setQuery(target.dataset.item)
        setIsVisible(false)
      } else if (key === 'Escape') {
        setIsVisible(false)
      }
    }
  }

  // Step 4: Sync external entries into trie when they change
  useEffect(() => {
    insertAll(entries)
  }, [entries])

  // Step 5: Read visible items from trie using current query as prefix
  const items = trie.current.getWithPrefix(query)

  // Step 6: Click handler — event delegation on <ul> instead of per-item onClick
  // Uses closest('[data-item]') to find the clicked <li> and extract its query value
  const onListClick: React.MouseEventHandler<HTMLUListElement> = ({ target }) => {
    const li = (target as HTMLElement).closest<HTMLElement>('[data-item]')
    if (li?.dataset.item) {
      setQuery(li.dataset.item)
      setIsVisible(false)
    }
  }

  // Step 7: Render — input[role=combobox] + conditional <ul role=listbox>
  // a11y: aria-expanded, aria-controls, aria-selected, aria-live for screen reader announcements
  return (
    <section className={cx(flex.flexColumnGap8, flex.padding8, flex.b1)} onKeyDown={onKeyDown}>
      <input
        aria-autocomplete="list"
        aria-controls={id}
        aria-expanded={items.length > 0 && isVisible}
        aria-label="search"
        role="combobox"
        onChange={onQueryChange}
        value={query}
        type="text"
      />
      {items.length > 0 && isVisible ? (
        <ul id={id} role="listbox" onClick={onListClick}>
          {items.map((item: TTypeaheadEntry<T>) => (
            <li
              className={css.item}
              data-item={item.query}
              role="option"
              aria-selected={item.query === query}
              tabIndex={0}
              key={item.id}
            >
              {itemRender(item)}
            </li>
          ))}
        </ul>
      ) : null}
      <div role="status" aria-live="polite">
        {isLoading ? `loading` : `${items.length} results`}
      </div>
    </section>
  )
}
