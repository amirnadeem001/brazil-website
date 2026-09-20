export type GitHubConnectionStatus =
  | {
      connected: true;
      owner: string;
      repository: string;
      branch: string;
    }
  | {
      connected: false;
      error: string;
    };
