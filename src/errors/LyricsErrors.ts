export class LyricsNotFoundError extends Error {
  constructor(message = 'Lyrics not found.') {
    super(message);
    this.name = 'LyricsNotFoundError';
  }
}

export class LyricsAPIError extends Error {
  constructor(message = 'Lyrics API error.') {
    super(message);
    this.name = 'LyricsAPIError';
  }
}

export class LyricsTimeoutError extends Error {
  constructor(message = 'Lyrics API timeout.') {
    super(message);
    this.name = 'LyricsTimeoutError';
  }
}
