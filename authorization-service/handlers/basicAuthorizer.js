const generatePolicy = (principalId, resource, effect = 'Allow') => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};

module.exports.basicAuthorizer = async (event) => {
  if (event.type !== 'TOKEN') return 'Unauthorized';

  try {
    const authorizationToken = event.authorizationToken;

    const encodedCreds = authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');
    const [userName, password] = buff.toString('utf-8').split(':');

    const storedUserPassword = process.env[userName];
    const effect = (!storedUserPassword || storedUserPassword !== password) ? 'Deny' : 'Allow';

    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    return policy;
  }
  catch (error) {
    return `Unauthorized: ${error.message}`;
  }
};
