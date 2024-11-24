import Axios from 'axios'
import jsonwebtoken, { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-o3iexwjvu0zlzzyg.us.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })
  let verifyCert;
  try {
    const resJwks = await Axios.get(jwksUrl);
    const signKeys = resJwks.data.keys.find(k => k.id === jwt.header.kid);
    if (!signKeys) {
      throw new Error("Key is incorrect: ", jwt.header.kid);
    }
    const secret = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJVIvqvrxoe9D1MA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1vM2lleHdqdnUwemx6enlnLnVzLmF1dGgwLmNvbTAeFw0yNDExMjMw
MzUzNTNaFw0zODA4MDIwMzUzNTNaMCwxKjAoBgNVBAMTIWRldi1vM2lleHdqdnUw
emx6enlnLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAMyiybyMpNYjSB78rt38R2vs2OyNpuJ0+HajOGQGQ+035jlW0DSHGL/KqvmQ
U1ugaK5xxWYn8m5YBejFGFuVB5ktK5TWeMFFLou1IqbwIkKsu6Kp6NW1X4RaKIUl
7TqaAGAOW34CZG9y+gSOoFWr0xNPln6aH4XWwgFU1MnWFK1T+GI4U9Cnv4AHiTEL
/YlGIUWZhob7WkTJJShco60gt+3xsM2iLBfq/SEu8q0urk0txHIWJ04KPebdpNbu
YOln+2sjfHfH1/MpPAvOIlZk5wtJMdCY3loAbgHRC8hI80jo3X5DTssfyQ0QPzqk
sNQTIVulYmHn3Ihad+vpfSOiVxsCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUEEYJM/OKQ1C46kE1gU/9zFUWNo0wDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQCN+EO09esbinr8NuFZEW8HpXT5QJ/HiElXual37OXF
Poq1PK4oUwFQ4WJ0wUczFuHnlyUyWi6Gy5hDNqLd6c6XCeFSc4rhyMqhBigMohyV
ipyBwJ4ELdmfbkpHKpIz99qdz+Dx1ZxyJ49R3tfegdL0sA+wX+JySwUzyCWbMY1/
iCM4OBcYAZwpYWg4SjH3UKDDDEVsgw+NT8FbKSbYl7kKQvTYnisu2KAKtvEm3wgQ
50dea47oHIPXkWGsZ4BvZYHqzaG6E5q3ZsFNpyUwL1ZKMeiqr50oUTj8jkjAP5vX
vbIeOT0yTxFohu+8TFEG53RxCilMAgtPJl7spcmWGHhR
-----END CERTIFICATE-----`;

verifyCert = verify(token, secret, {algorithms: ['RS256']});;

  } catch (error) {
    logger.error("VerifyToken failed: ", error);
  }

  return verifyCert;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
