/* eslint-disable react/jsx-pascal-case */
import React, { forwardRef, useRef, useState, useCallback } from 'react'
import _Portal from '@reach/portal'
import { BottomSheet as _BottomSheet } from './BottomSheet'
import type { Props, RefHandles, SpringEvent } from './types'
import { useLayoutEffect } from './hooks'

// Fix for TS error with @reach/portal
const Portal = _Portal as unknown as React.FC<React.PropsWithChildren<any>>

export type {
  RefHandles as BottomSheetRef,
  Props as BottomSheetProps,
} from './types'

// Main BottomSheet component
export const BottomSheet = forwardRef<RefHandles, Props>(function BottomSheet(
  { onSpringStart, onSpringEnd, skipInitialTransition, ...props },
  ref
) {
  // Mounted state helps SSR and prevents tabbing into closed sheet
  const [mounted, setMounted] = useState(false)
  const timerRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const lastSnapRef = useRef(null)
  // @TODO refactor to an initialState: OPEN | CLOSED property as it's much easier to understand
  // And informs what we should animate from. If the sheet is mounted with open = true, then initialState = OPEN.
  // When initialState = CLOSED, then internal sheet must first render with open={false} before setting open={props.open}
  // It's only when initialState and props.open is mismatching that a intial transition should happen
  // If they match then transitions will only happen when a user interaction or resize event happen.
  const initialStateRef = useRef<'OPEN' | 'CLOSED'>(
    skipInitialTransition && props.open ? 'OPEN' : 'CLOSED'
  )

  // Layout effect ensures initial open state without transition
  useLayoutEffect(() => {
    if (props.open) {
      cancelAnimationFrame(timerRef.current)
      setMounted(true)

      return () => {
        initialStateRef.current = 'CLOSED'
      }
    }
  }, [props.open])

  // Forward onSpringStart events
  const handleSpringStart = useCallback(
    async function handleSpringStart(event: SpringEvent) {
      await onSpringStart?.(event)

      if (event.type === 'OPEN') {
        cancelAnimationFrame(timerRef.current)
      }
    },
    [onSpringStart]
  )

  // Forward onSpringEnd events
  const handleSpringEnd = useCallback(
    async function handleSpringEnd(event: SpringEvent) {
      await onSpringEnd?.(event)

      if (event.type === 'CLOSE') {
        timerRef.current = requestAnimationFrame(() => setMounted(false))
      }
    },
    [onSpringEnd]
  )

  // Avoid rendering when unmounted (SSR-friendly)
  if (!mounted) {
    return null
  }

  return (
    <Portal data-rsbs-portal>
      <_BottomSheet
        {...props}
        lastSnapRef={lastSnapRef}
        ref={ref}
        initialState={initialStateRef.current}
        onSpringStart={handleSpringStart}
        onSpringEnd={handleSpringEnd}
      />
    </Portal>
  )
})
