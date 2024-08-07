import type { RemoveNeverProps, StringKeys } from '@subframe7536/type-utils'
import type { Accessor, FlowComponent, JSX } from 'solid-js'
import { DEV } from 'solid-js'
import { createComponent, render } from 'solid-js/web'

type RequiredKeysOfObject<T> = StringKeys<RemoveNeverProps<{
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}>>

type App = {
  /**
   * Add a Provider to the app. The list of provider will be merged
   * at mount time.
   *
   * @param provider provider to add to the list
   * @param props provider options
   */
  use: <Props>(
    provider: FlowComponent<Props>,
    ...props: RequiredKeysOfObject<Props> extends never ? [props?: Props] : [props: Props]
  ) => App

  /**
   * merges all the Providers and then uses the `render` function
   * to mount the application.
   *
   * @param domElement HTML Element or selector
   */
  mount: (domElement: string) => ReturnType<typeof render>
}

type Provider<Props extends Record<string, any>> = [
  provider: FlowComponent<Props>,
  props?: Props,
]

type MergeParams = {
  app: (props?: any) => JSX.Element
  props?: Record<string, any>
  providers: Provider<any>[]
}

function mergeProviders({ app, props = {}, providers }: MergeParams): Accessor<JSX.Element> {
  return providers.reduce(
    (application, [provider, opts = {}]) => () =>
      createComponent(provider, {
        ...opts,
        get children() {
          return application()
        },
      }),
    () => createComponent(app, props),
  )
}

/**
 * Vue's `createApp` like initialization
 * @param app App component
 * @param appProps App params
 * @example
 * ```ts
 * import { createApp } from '@solid-hooks/core'
 * import App from './App'
 *
 * createApp(App)
 *   .use(RouterProvider, { props })
 *   .use(I18nProvider)
 *   .use(GlobalStoreProvider)
 *   .mount('#app')
 * ```
 *
 * is equal to:
 *
 * ```tsx
 * render(
 *   <RouterProvider props={props}>
 *     <I18nProvider>
 *       <GlobalStoreProvider>
 *         <App />
 *       </GlobalStoreProvider>
 *     </I18nProvider>
 *   </RouterProvider>,
 *   document.querySelector('#app')
 * )
 * ```
 */
export function createApp<AppProps extends Record<string, any> = {}>(
  app: FlowComponent<AppProps>,
  ...appProps: RequiredKeysOfObject<AppProps> extends never ? [appProps?: AppProps] : [appProps: AppProps]
): App {
  const providers: Provider<any>[] = []

  const _app: App = {
    use: (provider, ...props) => {
      providers.push([provider, props[0]])
      return _app
    },

    mount: (dom) => {
      const application = mergeProviders({ app, props: appProps[0], providers })
      const root = document.querySelector(dom)
      if (DEV && !root) {
        throw new Error(`root node "${dom}" is null`)
      }
      return render(application, root!)
    },
  }

  return _app
}
