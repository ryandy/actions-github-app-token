import * as core from '@actions/core'

import {getAppToken} from './app_token'


async function run(): Promise<void> {
  try {
    // The App ID and private key are required Action inputs.
    const actionToken: string = core.getInput('GITHUB_TOKEN')
    const appId: string = core.getInput('GITHUB_APP_ID')
    const appPemEncoded: string = core.getInput('GITHUB_APP_PEM')

    if (!process.env.GITHUB_REPOSITORY) {
      throw new Error('Unexpected error: Missing GITHUB_REPOSITORY env variable');
    }
    const repo: string = process.env.GITHUB_REPOSITORY

    const appToken: string = await getAppToken(actionToken, appId, appPemEncoded, repo)
    core.setSecret(appToken)
    core.setOutput('GITHUB_APP_TOKEN', appToken)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
