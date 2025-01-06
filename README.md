# Bun Local-to-Cloud Sync

This project is a TypeScript-based application designed to synchronize files from a local directory to an S3-compatible object storage. It ensures efficient file handling by monitoring changes, computing file hashes, and syncing only modified or new files.

## Features

### Directory Watching

- Monitors a local directory (`C:\\Projects\\stories`) for file changes (creation, modification, and deletion).
- Automatically processes changed files.

### S3 Integration

- **Upload:** Automatically uploads new or modified files to an S3 bucket.
- **Delete:** Removes files from S3 if deleted locally.
- **Read:** Fetches and logs file content from S3 for validation.

### File Hashing and Verification

- Uses `blake2b256` hashing to detect file changes.
- Prevents redundant uploads by comparing current and previous hashes.

### Logging and Observability

- Logs file events and changes using `chalk`.
- Displays hash values and file content for debugging.

## Project Structure

- **[`index.ts`](index.ts)**: Main script for directory watching, file hashing, and S3 operations.
- **[`server.ts`](server.ts)**: Hono-based server for interacting with S3 and serving content via HTTP.
- **[`sendMessage.ps1`](sendMessage.ps1)**: PowerShell script for inter-process communication using named pipes.
- **[`types.ts`](types.ts)**: TypeScript type definitions.
- **[`config`](config)**: Configuration files.
- **`.env`**: Environment variables (e.g., S3 credentials).

## Prerequisites

- [Bun](https://bun.sh/) runtime installed.
- S3-compatible object storage (e.g., AWS S3, MinIO).
- Node.js and npm/yarn (optional for development).
- PowerShell (for the `sendMessage.ps1` script).

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd bun-local-to-cloud-sync
   ```

2. Install Dependencies

   ```bash
   bun install
   ```

3. Configure credentials using `config` package

   ```
   "S3_Access_Key": "<your-access-key>"
   "S3_Secret_Key": "<your-secret-key>"
   "S3_Storage_URL": "<your-storage-url>"
   ```

4. Run the app

   ```bash
   bun run dev
   ```

## Future plans

- Implement it as a daemon to track changes
- metadata storage and viewing using postgres
- optimize media uploads. etc
