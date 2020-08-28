import * as core from '@actions/core'
import {createAppAuth} from '@octokit/auth-app'
import {Octokit} from '@octokit/rest'


export async function getAppToken(appId: string,
                                  appPemEncoded: string,
                                  repo: string): Promise<string> {
  const appPem: string = Buffer.from(appPemEncoded, 'base64').toString()

  // Using the App ID and private key, create an App auth.
  // See https://octokit.github.io/rest.js/v18#authentication
  core.info('Create App auth')
  const appOctokit: Octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      id: parseInt(appId),
      privateKey: appPem,
    },
  })

  // Using the App auth and repo name, obtain the App installation ID.
  // See https://docs.github.com/en/rest/reference/apps
  core.info('Get App installation ID')
  const installationResponse = await appOctokit.request(
    `/repos/${repo}/installation`
  )
  const installationId: number = installationResponse.data['id']

  // Get the current repo's ID.
  // See https://docs.github.com/en/rest/reference/repos
  core.info('Get repo ID')
  const defaultOctokit: Octokit = new Octokit()
  const repoResponse = await defaultOctokit.request(`/repos/${repo}`)
  const repoId: number = repoResponse.data['id']

  // Finally, use the App auth and installation ID to obtain an App installation access token
  // with access limited to the current repo.
  // See https://octokit.github.io/rest.js/v18#apps
  core.info('Create App installation token')
  const tokenResponse = await appOctokit.apps.createInstallationAccessToken({
    installation_id: installationId,
    repository_ids: [repoId]
  })
  return tokenResponse.data['token']
}
