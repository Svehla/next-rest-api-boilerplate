import React from 'react'

type ApplyContextsProps = {
  contextProviders: any[]
  children: React.ReactNode
}

// TODO: add docs
export const ApplyContexts = (props: ApplyContextsProps) => (
  <>
    {props.contextProviders.reduce(
      (child, Context) => (
        <Context>{child}</Context>
      ),
      props.children
    )}
  </>
)

// TODO: add docs
export const withCtxProviders =
  <T,>(ctxProviders: any[]) =>
  (Component: any) =>
  (props: T) =>
    (
      <ApplyContexts contextProviders={ctxProviders}>
        <Component {...props} />
      </ApplyContexts>
    )
