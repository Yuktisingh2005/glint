const AWS = require('aws-sdk');

const rekognition = new AWS.Rekognition({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const analyzeImage = async (bucket, key) => {
  const params = {
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: key
      }
    },
    MaxLabels: 10,
    MinConfidence: 75
  };

  try {
    const result = await rekognition.detectLabels(params).promise();
    const labels = result.Labels.map(label => label.Name.toLowerCase());
    return labels;
  } catch (err) {
    console.error('Rekognition error:', err);
    return [];
  }
};

module.exports = analyzeImage;
