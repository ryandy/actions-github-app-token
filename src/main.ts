import * as core from '@actions/core'

import {getAppToken} from './app_token'


async function run(): Promise<void> {
  try {
    // The App ID and private key are required Action inputs.
    const appId: string = core.getInput('GITHUB_APP_ID')
    const appPemEncoded: string = core.getInput('GITHUB_APP_PEM')

    if (!process.env.GITHUB_REPOSITORY) {
      throw new Error('Unexpected error: Missing GITHUB_REPOSITORY env variable');
    }
    const repository: string = process.env.GITHUB_REPOSITORY

    const appToken: string = await getAppToken(appId, appPemEncoded, repository)
    core.setSecret(appToken)
    core.setOutput('GITHUB_APP_TOKEN', appToken)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
