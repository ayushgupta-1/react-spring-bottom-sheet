/* eslint-disable react/jsx-pascal-case */
import React, { forwardRef, useRef, useState, useCallback } from 'react'
import { Portal } from '@reach/portal'
import { BottomSheet as _BottomSheet } from './BottomSheet'
import type { Props, RefHandles, SpringEvent } from './types'
import { useLayoutEffect } from './hooks'

export type {
  RefHandles as BottomSheetRef,
  Props as BottomSheetProps,
} from './types'

export const BottomSheet = forwardRef<RefHandles, Props>(function BottomSheet(
  { onSpringStart, onSpringEnd, skipInitialTransition, ...props },
  ref
) {
  const [mounted, setMounted] = useState(false)
  const timerRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const lastSnapRef = useRef(null)
  const initialStateRef = useRef<'OPEN' | 'CLOSED'>(
    skipInitialTransition && props.open ? 'OPEN' : 'CLOSED'
  )

  useLayoutEffect(() => {
    if (props.open) {
      cancelAnimationFrame(timerRef.current)
      setMounted(true)
      return () => {
        initialStateRef.current = 'CLOSED'
      }
    }
  }, [props.open])

  const handleSpringStart = useCallback(
    async (event: SpringEvent) => {
      await onSpringStart?.(event)
      if (event.type === 'OPEN') cancelAnimationFrame(timerRef.current)
    },
    [onSpringStart]
  )

  const handleSpringEnd = useCallback(
    async (event: SpringEvent) => {
      await onSpringEnd?.(event)
      if (event.type === 'CLOSE') {
        timerRef.current = requestAnimationFrame(() => setMounted(false))
      }
    },
    [onSpringEnd]
  )

  if (!mounted) return null

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
