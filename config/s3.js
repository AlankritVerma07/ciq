const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});
//upload a file to s3
exports.uploadFile = (file) => {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
};

exports.uploadMultipleFile = async (files) => {
  const uploadParams = files.map((file) => {
    const fileStream = fs.createReadStream(file.path);
    return {
      Bucket: bucketName,
      Body: fileStream,
      Key: file.filename,
    };
  });
  // console.log(uploadParams);
  return await Promise.all(
    uploadParams.map((param) => s3.upload(param).promise())
  );
};

//get a file from s3
exports.getFileStream = (fileKey) => {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
};
// exports.getFileStream = (fileKey) => {
//   const downloadParams = {
//     Key: fileKey,
//     Bucket: bucketName,
//   };
//   const data = s3.getObject(downloadParams).promise();
//   return data;
// };

exports.deleteFile = (fileKey) => {
  const deleteParams = {
    Key: fileKey,
    Bucket: bucketName,
  };
  return s3.deleteObject(deleteParams).promise();
};

// exports.deleteMultipleFile = async (files) => {
//   const deleteParams = files.map((file) => {
//     return {
//       Key: file.filename,
//       Bucket: bucketName,
//     };
//   });
//   return await Promise.all(
//     deleteParams.map((param) => s3.deleteObject(param).promise())
//   );
// };
exports.deleteMultipleFile = async (fileKeys) => {
  const deleteParams = fileKeys.map((string) => {
    const fileKey = string.split('/');
    return {
      Key: fileKey[5],
      Bucket: bucketName,
    };
  });
  return await Promise.all(
    deleteParams.map((param) => s3.deleteObject(param).promise())
  );
};
// exports.uploadFile = uploadFile;
//downloads a file from s3
