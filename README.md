# actions-github-app-token

## Impersonate Your GitHub App In A GitHub Action

This Action can obtain an authenticated App installation token using a GitHub App ID and private key. You can use this token inside an Actions workflow instead of GITHUB_TOKEN, in cases where the GITHUB_TOKEN does not meet your needs.

This Action is a typescript port of [machine-learning-apps/actions-app-token](https://github.com/machine-learning-apps/actions-app-token).

## Background

[GitHub Actions](https://github.com/features/actions) allows for easy, powerful workflow automation. But it has one significant shortcoming that limits its potential: [one workflow cannot kick off another workflow](https://docs.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token#using-the-github_token-in-a-workflow). For example, if you have an auto-formatting job that pushes small code changes to a PR branch, that pull_request.synchronize event would not kick off any workflows, even if a pull_request workflow is defined for that repo. This is advertised as a [feature](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#triggering-new-workflows-using-a-personal-access-token) of GitHub Actions because it prevents incidental infinite recursion. Unfortunately there’s no way to turn this feature off, and there’s no obvious way to work around it.

[GitHub Apps](https://docs.github.com/en/developers/apps/about-apps) is GitHub’s solution for integrating with third party services and applications. The idea is that you can write an application, deploy it somewhere, and GitHub will allow it to authenticate its requests using a “GitHub App” identity. The trick is - and this does not appear to be advertised broadly - you don’t actually need to write any application code or do any cloud deployment to utilize a GitHub App identity. And this GitHub App identity does not have the same restrictions as the default GitHub Actions identity described above.

## Use Case

This Action is helpful if you want your automated workflows to:
- Push code commits
- Create or modify pull requests
- Create or modify releases
- Create deployments

These sorts of activities are already possible using a variety of open source Actions, but if the default GITHUB_TOKEN is used, no further workflows will occur (i.e. workflows triggered by events like push, pull_request, release, deployment, etc). This Action is meant to complement these other functional Actions by providing a more useful token.

## Requirements

[Create a GitHub App](https://docs.github.com/en/developers/apps/creating-a-github-app) associated with your personal or organization account.

[Install the App](https://docs.github.com/en/developers/apps/installing-github-apps) on one or more repositories owned by that account.

Create two [GitHub secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) accessible to the repository:
- App ID (located on the App settings page)
- base64-encoded App PEM (generate a private key then run `cat private-key.pem | base64`)

## Examples

### Automerge

```yaml
  - uses: ryandy/actions-github-app-token@main
    id: app_token
    with:
      GITHUB_TOKEN: ${{ github.token }}
      GITHUB_APP_ID: ${{ secrets.YOUR_APP_ID }}
      GITHUB_APP_PEM: ${{ secrets.YOUR_BASE64_ENCODED_APP_PEM }}
  - uses: pascalgn/automerge-action@master
    env:
      GITHUB_TOKEN: ${{ steps.app_token.outputs.GITHUB_APP_TOKEN }}
```

### Pushing Code

```yaml
  - uses: ryandy/actions-github-app-token@main
    id: app_token
    with:
      GITHUB_TOKEN: ${{ github.token }}
      GITHUB_APP_ID: ${{ secrets.YOUR_APP_ID }}
      GITHUB_APP_PEM: ${{ secrets.YOUR_BASE64_ENCODED_APP_PEM }}
  - uses: ad-m/github-push-action@master
    with:
      github_token: ${{ steps.app_token.outputs.GITHUB_APP_TOKEN }}
```

## Security

App permissions are highly customizable. [This](https://docs.github.com/en/rest/reference/permissions-required-for-github-apps) is a detailed list of all permission settings and what they enable. As a point of reference (and good starting point), [here](https://docs.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token#permissions-for-the-github_token) are the permissions granted to the default GITHUB_TOKEN. Take care not to over-grant permissions when setting up your GitHub App.

The token generated by this Action is temporary and expires after 1 hour. Using an expired token produces a status code of `401 - Unauthorized`, and requires creating a new installation token. The token is automatically limited in scope to only the current repo (the GITHUB_REPOSITORY env variable). So even if your App is installed on multiple repos, it will only have access to the one.

The Action takes care of registering the generated installation token as a secret value by using the [::add-mask command](https://docs.github.com/en/actions/reference/workflow-commands-for-github-actions#masking-a-value-in-log). This prevents the token value from accidentally being logged during subsequent workflow steps.

Uploading your App's private key as a GitHub secret is a one-time process with limited risk, assuming good precautions are taken (e.g. deleting the local key file after uploading).

See additional documentation about [creating App installation tokens](https://docs.github.com/en/rest/reference/apps#create-an-installation-access-token-for-an-app) and [authenticating as an App installation](https://docs.github.com/en/developers/apps/authenticating-with-github-apps#authenticating-as-an-installation).

## Contributing

### Install the dependencies
```bash
$ npm install
```

### Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

### Run the tests
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

### Making changes to action.yml

The action.yml defines the inputs and outputs for the action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

### Making changes to source code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
import * as core from '@actions/core';
...

async function run() {
  try { 
      ...
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

### Validate

In addition to building and unit testing, the action itself is run as part of a pull_request workflow (see [test.yml](.github/workflows/test.yml)).
