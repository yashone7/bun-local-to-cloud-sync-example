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
import path from "path";
import mime from "mime";

const directoryToWatch = "C:\\Projects\\stories";

interface FileHash {
  previousHash: Buffer | null;
  nextHash: Buffer | null;
}

const fileHashes: Map<string, FileHash> = new Map();

async function watchDirectory() {
  try {
    const watcher = watch(
      directoryToWatch,
      { recursive: true },
      async (event, filename) => {
        if (filename) {
          console.log(`Change ${event} detected in ${filename}`);
          await computeAndCompareHash(filename);
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
}

// implement all upload all files in S3 here
async function uploadAllFilesToS3InFolder() {}

async function computeAndCompareHash(filepath: string) {
  try {
    const file = Bun.file(`${directoryToWatch}/${filepath}`);
    const fileBuffer = await file.arrayBuffer();
    if (getFileExtension(filepath) === "txt") {
      const text = await file.text();
      console.log(chalk.green(text));
    }

    const hasher = new Bun.CryptoHasher("blake2b256");
    hasher.update(fileBuffer);
    const currentHash = hasher.digest();

    console.log(currentHash, "DIGESTED HASH OF THE FILE");

    verifyFile(filepath, `${directoryToWatch}/${filepath}`, currentHash);
  } catch (err) {
    console.log(err);
  }
}
function getFileExtension(filename: string): string {
  return path.extname(filename).slice(1).toLowerCase();
}

function getMimeType(filePath: string): string {
  return mime.getType(filePath) || "application/octet-stream";
}

async function readFileAsBinary(filePath: string): Promise<Buffer> {
  const file = Bun.file(filePath);
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function verifyFile(filename: string, filepath: string, currentHash: Buffer) {
  let fileHash = fileHashes.get(filename);

  if (!fileHash) {
    console.log(chalk.blue(`Initial file save detected for ${filename}`));
    fileHash = { previousHash: null, nextHash: currentHash };
    fileHashes.set(filename, fileHash);
    uploadToS3({
      bucketName: "test-bucket",
      key: filename,
      filePath: filepath,
    });
  } else if (isEqual(currentHash, fileHash.nextHash)) {
    console.log(chalk.blue(`File ${filename} hasn't changed`));
  } else {
    console.log(chalk.red(`File ${filename} has changed`));
    console.log(
      chalk.yellow(`Previous hash: ${fileHash.nextHash?.toString("hex")}`)
    );
    console.log(chalk.yellow(`Current hash: ${currentHash.toString("hex")}`));

    // Update hashes
    fileHash.previousHash = fileHash.nextHash;
    fileHash.nextHash = currentHash;
    fileHashes.set(filename, fileHash);

    // if we want the diffs of the file we can compute diffs and also store them in S3
    uploadToS3({
      bucketName: "test-bucket",
      key: filename,
      filePath: filepath,
    });
  }
}

/**
 * here we have created a function which actually uploads a file to S3
 * PutObect accepts file as a Buffer
 */
async function uploadToS3({ bucketName, key, filePath }: uploadToS3Type) {
  try {
    const s3_client = connectToS3();

    const fileContent = await readFileAsBinary(filePath);
    const mimeType = getMimeType(filePath);

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ContentType: mimeType,
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
