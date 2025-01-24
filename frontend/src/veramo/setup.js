import { createAgent } from '@veramo/core'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'

const INFURA_PROJECT_ID = 'de45f863bca94210b908eb51d7de3c49'

export const agent = createAgent({
  plugins: [
    new DIDResolverPlugin({
      ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
      ...webDidResolver(),
    }),
  ],
})
