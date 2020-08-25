import * as core from '@actions/core'
import {App} from '@octokit/app'

import {Octokit} from '@octokit/rest'
import {createAppAuth} from '@octokit/auth-app'


  //core.info(`PEM: ${app_pem}`)
  //const app = new App({ id: app_id, privateKey: app_pem });
  //const jwt = app.getSignedJsonWebToken();
  //core.info(`jwt: ${jwt}`)

  //const result = await appOctokit.request(result.data["access_tokens_url"])


export async function get_app_token(app_id: string,
                                    app_pem_encoded: string,
                                    repo: string): Promise<string> {

  const app_pem: string = Buffer.from(app_pem_encoded, 'base64').toString()


  const appOctokit: Octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      id: parseInt(app_id),
      privateKey: app_pem,
    },
  })

  const installation_result = await appOctokit.request("/repos/ryandy/action-app-test/installation")

  const token_result = await appOctokit.apps.createInstallationAccessToken({
    installation_id: installation_result.data["id"],
  })

  return token_result.data["token"]
}
