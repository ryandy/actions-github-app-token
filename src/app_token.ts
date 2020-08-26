import {createAppAuth} from '@octokit/auth-app'
import {Octokit} from '@octokit/rest'


export async function getAppToken(appId: string,
                                  appPemEncoded: string,
                                  repository: string): Promise<string> {
  const appPem: string = Buffer.from(appPemEncoded, 'base64').toString()
  const [owner, repo]: string[] = repository.split('/')

  // Using the App ID and private key, create an App auth.
  // See https://octokit.github.io/rest.js/v18#authentication
  const appOctokit: Octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      id: parseInt(appId),
      privateKey: appPem,
    },
  })

  // Using the App auth and repo name, obtain the App installation ID.
  // See https://docs.github.com/en/rest/reference/apps
  const installationResponse = await appOctokit.request(
    `/repos/${owner}/${repo}/installation`
  )

  // Finally, use the App auth and installation ID to obtain an App installation access token.
  // See https://octokit.github.io/rest.js/v18#apps
  const tokenResponse = await appOctokit.apps.createInstallationAccessToken({
    installation_id: installationResponse.data['id'],
  })
  return tokenResponse.data['token']
}
