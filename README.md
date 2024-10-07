# Apigee Proxy Deployment Instructions

These instructions outline the steps to deploy your Apigee proxy using the Apigee pipeline template.

## Prerequisites

Before you begin, ensure you have the following in place:

- An Apigee account and API proxy in Apigee.
- Access to a GitHub repository for version control.
- Values mentioned in the `.env` file.

## Deployment Steps

1. **Create a New Repository**
   
   Create a new GitHub repository named after your Apigee proxy using the `apigee-pipeline-template-v2`.

2. **Clone the Repository**

   Clone the newly created repository to your local machine using Git.
   ```bash
   git clone <repository-url>

4. **Create a Development Branch**

   Create a new branch named 'LBXAPIS-####-dev' for your development work.  Where #### is the ticket number
   ```bash
   git checkout -b dev

6. **Update Environment Variables**

   Update the following environment variables in the `.env` file with appropriate values:

   - `PROXY_NAME`
   - `PROXY_REVISION`
   - `PRODUCT_NAME`
   - `KVM_NAME`
   - `RELEASE_TICKET`

7. **Commit and Push Changes**

   Commit the changes to the 'LBXAPIS-####-dev' branch and push it to your GitHub repository. This action will trigger the GitHub Action to pull the proxy bundle and commit it back to the repository.
   ```bash
   git add .
   git commit -m "Update environment variables"
   git push origin LBXAPIS-####-dev

8. **Create a dev branch from the master branch**

9. **Merge feature branch (LBXAPIS-####-dev) into dev branch**

10. **Create a GitHub Tag**

    Once the pull request is approved, create a GitHub tag with the proper version.

      [Creating a tag](https://docs.github.com/en/authentication/managing-access-to-your-organizations-repositories/assigning-tags-to-releases)

11. **Create a Release Branch**

    Create a new branch off the tag, and name it for your release.
      ```bash
      git checkout -b <release-branch-name> <tag-name>


12. **Create a Staging Branch**

    When you're ready to deploy to the staging environment, create a new branch named 'staging'.
      ```bash
      git checkout -b staging

13. **Open a Pull Request to Staging**

    Open a pull request from the release branch to the staging branch. This action will trigger the deployment GitHub Action.
      ```bash
      gh pr create --base staging --head <release-branch-name>


14. **Create a Production Branch**

    When you're ready to deploy to the production environment, create a 'prod' branch and open a pull request from the release branch to the 'prod' branch.

      ```bash
      git checkout -b prod

Note: Update the `.env` file with the RELEASE_TICKET number from the CAB board.

15. **Open a Pull Request to Prod**

    Open a pull request from the release branch to the staging branch. This action will trigger the deployment GitHub Action.
      ```bash
      gh pr create --base prod --head <release-branch-name>


NOTE. **Pull in changes from template repo**

This guide explains how to manually sync or pull changes from a template repository into your own project repository after the initial creation. GitHub doesn't support direct synchronization after cloning, so these steps help manage updates manually.


First, add the template repository as a remote to your local repository if it hasn't been added yet:
   ```bash
   git remote add template https://github.com/EDRInc/apigee-pipeline-template-v2.git
   ```
Second, fetch the template repo:
   ```bash
   git fetch template
   ```
Third, merge template/master into your current branch:
   ```bash
   git merge template/master --allow-unrelated-histories
   ```
Fourth, Resolve conflicts if any:
   ```bash
   git add .
   ```
Fifth, Commit changes:
   ```bash
   git commit -m "Resolved conflicts while merging template"
   ```
Sixth, Push changes:
   ```bash
   git push origin merge-template
   ```








