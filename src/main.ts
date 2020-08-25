import * as core from '@actions/core'
import {get_app_token} from './wait'

async function run(): Promise<void> {
  try {
    const app_id: string = core.getInput('GITHUB_APP_ID')
    const app_pem_encoded: string = core.getInput('GITHUB_APP_PEM')
    const repository: string = process.env.GITHUB_REPOSITORY

    core.info(`App ID: ${app_id}`)
    core.info(`Repo: ${repository}`)
    //core.info(`PEM encoded: ${app_pem_encoded}`)

    const app_token: string = await get_app_token(app_id, app_pem_encoded, repository)
    core.setSecret(app_token)
    core.setOutput('GITHUB_APP_TOKEN', app_token)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
