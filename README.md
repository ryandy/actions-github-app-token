# actions-github-app-token

Impersonate Your GitHub App In A GitHub Action

This Action can obtain an authenticated App installation token using a GitHub App ID and private key. You can use this token inside an Actions workflow instead of GITHUB_TOKEN, in cases where the GITHUB_TOKEN does not meet your needs.

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
    id: get_token
    with:
      GITHUB_APP_ID: ${{ secrets.YOUR_APP_ID }}
      GITHUB_APP_PEM: ${{ secrets.YOUR_BASE64_ENCODED_APP_PEM }}
  - uses: pascalgn/automerge-action@master
    env:
      GITHUB_TOKEN: "${{ steps.get_token.outputs.GITHUB_APP_TOKEN }}"
```

### Pushing Code

```yaml
  - uses: ryandy/actions-github-app-token@main
    id: get_token
    with:
      GITHUB_APP_ID: ${{ secrets.YOUR_APP_ID }}
      GITHUB_APP_PEM: ${{ secrets.YOUR_BASE64_ENCODED_APP_PEM }}
  - uses: ad-m/github-push-action@master
    with:
      github_token: ${{ steps.get_token.outputs.GITHUB_APP_TOKEN }}
```

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
