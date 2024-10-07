const apigeejs = require('apigee-edge-js'),
  apigee = apigeejs.apigee;
const util = require('util');
const fs = require('fs');
const core = require('@actions/core');


const APIGEE_ORGANIZATION = process.env.APIGEE_ORGANIZATION; // Get the orgName from the command line arguments
const PROXY_NAME = process.env.PROXY_NAME; // Get the apiName from the command line arguments
const APIGEE_ENVIRONMENT = process.env.APIGEE_ENVIRONMENT;
const USERNAME = process.env.APIGEE_USER; // Get the APIGEE username from the command line arguments
const PASSWORD = process.env.APIGEE_PASSWORD;
const PROXY_REVISION = process.env.PROXY_REVISION;
const FILE_PATH = `./${PROXY_NAME}`;
// Get the APIGEE password from the command line arguments

const options = {
  org: APIGEE_ORGANIZATION,
  user: USERNAME,
  password: PASSWORD
};

function uploadProxyFilesAndDeploy(proxyName, filePath) {
  apigee.connect(options)
    .then(org => {
      return org.proxies.import({ name: proxyName, source: filePath })
        .then(result => {
          console.log(`Successfully deployed ${proxyName} from ${filePath}`);
          const newRevision = result.revision;
          return org.proxies.getDeployments({ name: proxyName, environment: APIGEE_ENVIRONMENT }).then(result => {
            const currentlyDeployedRevision = findDeployedRevisionNumber(result);
            console.log(`currently deployed proxy revision result in ${APIGEE_ENVIRONMENT}: `, currentlyDeployedRevision);
            if (currentlyDeployedRevision !== newRevision) {
              deployRevision(proxyName, newRevision, APIGEE_ENVIRONMENT);
            }
          })
        })
        .catch(error => {
          console.log(util.format(error));
          process.exit(1);
        });
    })
    .catch(error => {
      console.log(util.format(error));
      process.exit(1);
    });
}


function deployRevision(proxyName, proxyRevision, environment) {
  apigee.connect(options)
    .then(org => {
      // First, get deployments.
      return org.proxies.deploy({ name: proxyName, revision: proxyRevision, environment: environment })
        .then(result => {
          const previouslyDeployedProxyRevision = extractPreviouslyDeployedRevisionName(result);
          core.setOutput('previousRevision', previouslyDeployedProxyRevision);

          //fs.writeFileSync(process.env.GITHUB_OUTPUT, `PREVIOUS_REVISION_FOR_UNDEPLOY=${previouslyDeployedProxyRevision}`); 
        })
    })
    .catch(error => {
      console.log(util.format(error));
      process.exit(1);
    });
}

function undeployProxy(proxyName, environment) {
  apigee.connect(options)
    .then(org => {
      // First, get deployments.
      return org.proxies.getDeployments({ name: proxyName, environment: environment })
        .then(result => {
          let currentlyDeployedRevision = findDeployedRevisionNumber(result);
          console.log(`currently deployed proxy revision result in ${environment}: `, currentlyDeployedRevision);
          //fs.appendFileSync(process.env.GITHUB_ENV, `PREVIOUS_REVISION_FOR_UNDEPLOY=${currentlyDeployedRevision}\n`);
          return org.proxies.undeploy({ name: proxyName, revision: currentlyDeployedRevision, environment: environment }).then(result => {
            console.log(`Successfully undeployed ${PROXY_NAME} from ${environment}`);
          })
        })
    })
    .catch(error => {
      console.log(util.format(error));
      process.exit(1);
    });
}


function extractPreviouslyDeployedRevisionName(data) {
  // Find the proxy with undeployed state in the 'environment' array
  // and return the name of the revision in that proxy's 'name' property
  // or return 'No deployed revision found' if no undeployed revision is found
  // or return 'No deployed revision found' if the 'environment' array is empty
  // or return 'No deployed revision found' if the 'environment' array is undefined

  // Check if the 'environment' array is empty or undefined
  try {
    if (data?.environment?.length === 0 || !data?.environment) {
      return 'NA';
    } else {
      return data?.environment?.find(env => env.state === 'undeployed')?.name;
    }
  } catch (e) {
    console.log(e);
    return 'NA';
  }
}

function findDeployedRevisionNumber(response) {
  // Parse the response if it's a JSON string, otherwise assume it's already an object
  const data = typeof response === 'string' ? JSON.parse(response) : response;

  // Check if there's a revision array and it's not empty
  if (Array.isArray(data.revision) && data.revision.length > 0) {
    // Iterate over the revisions to find the first one with a deployed status
    for (const revision of data.revision) {
      // Assuming 'deployed' status is relevant to the servers in the revision
      if (revision.state === 'deployed') {
        // Return the name from the configuration of the first revision with a deployed server
        return revision.name;
      }
    }
  }

  // Return null or any other suitable value if no deployed configuration is found
  return null;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const functionName = args[0];
  const revision = args[1];


  switch (functionName) {
    case 'uploadProxyFilesAndDeploy':
      uploadProxyFilesAndDeploy(PROXY_NAME, FILE_PATH);
      break;
    case 'undeployProxy':
      undeployProxy(PROXY_NAME, APIGEE_ENVIRONMENT);
      break;
    case 'deployRevision':
      deployRevision(PROXY_NAME, revision, APIGEE_ENVIRONMENT);
      break;
    default:
      console.log('Function not found.');
  }
}


module.exports = {
  deployRevision,
  undeployProxy,
  uploadProxyFilesAndDeploy
}; // Get the APIGEE password from the command line arguments