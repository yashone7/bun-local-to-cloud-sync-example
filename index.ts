import { watch } from "fs";
import chalk from "chalk";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import config from "config";
import type { uploadToS3Type } from "./types";
import isEqual from "lodash/isEqual";

const directoryToWatch = "C:\\Projects\\stories";

let originalHash: Buffer | null = null;
let currentHash: Buffer | null = null;

async function watchDirectory() {
  try {
    const watcher = watch(
      directoryToWatch,
      { recursive: true },
      async (event, filename) => {
        console.log(`Change ${event} detected in ${filename}`);
        await computeHash(filename);
        if (filename !== null) {
          verifyFile(filename, `${directoryToWatch}/${filename}`);
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
}

async function computeHash(filepath: string | null) {
  try {
    const file = Bun.file(`${directoryToWatch}/${filepath}`);
    const text = await file.text();
    const fileBuffer = await file.arrayBuffer();
    console.log(chalk.green(text));

    const hasher = new Bun.CryptoHasher("blake2b256");
    const hash = hasher.update(fileBuffer);
    currentHash = hasher.digest();

    console.log(currentHash, "DIGESTED HASH OF THE FILE");
  } catch (err) {
    console.log(err);
  }
}

function verifyFile(filename: string, filepath: string) {
  if (originalHash === null) {
    console.log(chalk.blue(`Initial file save detected`));
    uploadToS3({
      bucketName: "test-bucket",
      key: filename,
      filePath: filepath,
    });
  } else if (isEqual(currentHash, originalHash)) {
    console.log(chalk.blue(`File hasn't changed`));
  } else {
    console.log(chalk.red(`File has changed`));
    // here you can diff the file and store the diffs if you want
    uploadToS3({
      bucketName: "test-bucket",
      key: filename,
      filePath: filepath,
    });
  }
  originalHash = currentHash;
}

/**
 * here we have created a function which actually uploads a file to S3 
  
 */
async function uploadToS3({ bucketName, key, filePath }: uploadToS3Type) {
  try {
    const s3_client = connectToS3();

    const fileContent = await Bun.file(filePath).text();

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
    };

    const command = new PutObjectCommand(params);
    const response = await s3_client.send(command);

    console.log(response);
  } catch (err) {
    console.log(err);
  }
}

export function connectToS3() {
  const accessKeyId = config.get("S3_Access Key") as string;
  const secretAccessKey = config.get("S3_Secret_Key") as string;
  const endpoint = config.get("S3_Storage_URL") as string;

  const s3_client = new S3Client({
    region: "local",
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    endpoint,
    forcePathStyle: true,
  });

  return s3_client;
}

export async function readS3File(
  bucketName: string,
  key: string
): Promise<string | null> {
  try {
    const s3_client = connectToS3();

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3_client.send(command);

    // Check if the response body exists
    if (response.Body) {
      // Convert the readable stream to a string
      const fileContent = await response.Body.transformToString();
      console.log("File contents:");
      console.log(fileContent);

      return fileContent;
    } else {
      console.log("File is empty or doesn't exist");
      return null;
    }
  } catch (error) {
    console.error("Error reading file from S3:", error);
    return null;
  }
}

watchDirectory();
