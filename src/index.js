gopeed.events.onResolve(async (ctx) => {
  const url = ctx.req.url;

  // Resolve API key from extension settings
  const apiKey = gopeed.settings.apiKey;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('1fichier.com API key not configured. Please add your API key in the extension settings.');
  }

  try {
    // Init API
    const api = new OneFichierApi(apiKey);
    gopeed.logger.debug(`Resolve 1fichier url start: ${url}`);

    // Retrieve file info
    const fileInfo = await api.getFileInfo({ url });
    gopeed.logger.debug(`API Response getFileInfo: ${JSON.stringify(fileInfo)}`);

    // Generate download link
    const fileDownload = await api.getFileDownload({ url, cdn: 0, restrict_ip: 0 });
    gopeed.logger.debug(`API Response getFileDownload: ${JSON.stringify(fileDownload)}`);

    // Check valid download link
    if (fileDownload.status !== 'OK') {
      throw new Error(`API Error 1fichier: ${fileDownload.message || 'Erreur inconnue'}`);
    }
    if (!fileDownload.url) {
      throw new Error('No download URL returned by the API');
    }

    ctx.res = {
      name: fileInfo.filename,
      size: fileInfo.size,
      range: false,
      files: [
        {
          name: fileInfo.filename,
          size: fileInfo.size,
          req: {
            url: fileDownload.url,
            headers: {},
          },
        },
      ],
    };

    gopeed.logger.debug('Resolve 1fichier url success');
  } catch (error) {
    gopeed.logger.error(`Error: ${JSON.stringify(error)}`);
    throw new Error(`Unable to resolve 1fichier download: ${error.message}`);
  }
});

/**
 * 1fichier API
 */
class OneFichierApi {
  #apiKey = '';

  constructor(apiKey) {
    this.#apiKey = apiKey;
  }

  /**
   * Get file info
   * @param {{url: string}} body
   * @returns {Promise<{filename: string; size: number}>}
   */
  async getFileInfo(body) {
    return this.#post('https://api.1fichier.com/v1/file/info.cgi', body);
  }

  /**
   * Get file download link
   * @param {{url: string}} body
   * @returns {Promise<{url: string; status: 'OK'| 'KO'; message?: string}>}
   */
  async getFileDownload(body) {
    return this.#post('https://api.1fichier.com/v1/download/get_token.cgi', body);
  }

  /**
   * Make post request
   * @param {string} url
   * @param {Record<string, unknown>} body
   * @returns {Promise<unknown>}
   */
  async #post(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.#apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return await response.json();
  }
}
