import { ImageResponse } from '@vercel/og'
import type { NextRequest, NextResponse } from 'next/server'

export const config = { runtime: 'edge' }

import { height, OpenGraphImage, width } from 'components/OpenGraphImage'
import * as demo from 'lib/demo.data'

export default async function og(req: NextRequest, res: NextResponse) {
  const font = fetch(new URL('public/Inter-Bold.woff', import.meta.url)).then(
    (res) => res.arrayBuffer(),
  )
  const { searchParams } = new URL(req.url)

  const title = searchParams.get('title') || 'Forge Journal'

  return new ImageResponse(
    <OpenGraphImage title={title || demo.ogImageTitle} />,
    {
      width,
      height,
      fonts: [
        {
          name: 'Inter',
          data: await font,
          style: 'normal',
          weight: 700,
        },
      ],
    },
  )
}
