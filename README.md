# bun-local-to-cloud-sync

A file synchronization tool that watches a local directory and automatically syncs changes to S3 storage. Built with Bun.js.

## Features

- Real-time file watching with automatic S3 synchronization
- File hash comparison to detect changes
- Support for file creation, modification, and deletion
- MIME type detection for proper file handling
- REST API endpoints for file retrieval
- Named pipe support for inter-process communication

## Prerequisites

- [Bun](https://bun.sh) v1.1.26 or higher
- Local S3-compatible storage (like MinIO or LocalStack or Supabase Storage)
- PowerShell (for named pipe functionality)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```
