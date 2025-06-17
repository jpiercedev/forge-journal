import '../tailwind.css'

import { AppProps } from 'next/app'

export interface SharedPageProps {
  draftMode?: boolean
  token?: string
}

export default function App({
  Component,
  pageProps,
}: AppProps<SharedPageProps>) {
  return <Component {...pageProps} />
}
