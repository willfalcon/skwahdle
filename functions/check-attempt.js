exports.handler = async function (event, context) {
  const word = 'butts';
  const params = event.queryStringParameters;

  const correctArray = word.split('');
  const attempt = params.word.split('');

  const result = attempt.map((letter, index) => {
    if (correctArray[index] === letter) {
      return 'correct';
    } else if (correctArray.includes(letter)) {
      return 'kinda';
    } else {
      return 'wrong';
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ result }),
  };
};
