export interface HttpOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  timeout?: number;
}

export interface ApiError {
  err: boolean;
  status: string | number;
  statusText: string;
}

export type ApiResponse<T> = T | ApiError;

export const isApiError = (res: unknown): res is ApiError => {
  return (
    typeof res === "object" &&
    res !== null &&
    "err" in res &&
    (res as Record<string, unknown>).err === true
  );
};

export const helpHttp = () => {
  const handleErrors = (response: Response): Promise<unknown> => {
    if (!response.ok) {
      return response.json().catch(() => ({})).then((errorBody) => {
        return Promise.reject({
          err: true,
          status: response.status || '00',
          statusText: errorBody.message || response.statusText || 'error'
        });
      });
    }
    return response.json();
  };

  const customFetch = async (endpoint: string, options: HttpOptions): Promise<unknown> => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const controller = new AbortController();
    options.signal = controller.signal;
    options.method = options.method || 'GET';
    
    const headers = options.headers 
      ? { ...defaultHeaders, ...(options.headers as Record<string, string>) } 
      : defaultHeaders;
    
    const optionsWithHeaders = {
      ...options,
      headers
    };

    // Send cookies automatically (httpOnly token set by backend)
    optionsWithHeaders.credentials = 'include';

    if (optionsWithHeaders.body && typeof optionsWithHeaders.body !== "string") {
      optionsWithHeaders.body = JSON.stringify(optionsWithHeaders.body);
    }

    const timeout = optionsWithHeaders.timeout || 5000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(endpoint, optionsWithHeaders as RequestInit);
      clearTimeout(timeoutId);
      return await handleErrors(response);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (isApiError(err)) {
        return err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        return { err: true, status: '408', statusText: 'Request timed out' };
      }
      return { err: true, status: '500', statusText: (err as Error)?.message || 'Internal Server Error' };
    }
  };

  const request = (method: string) => (url: string, options: HttpOptions = {}) => {
    options.method = method;
    return customFetch(url, options);
  };

  return {
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    del: request('DELETE'),
  };
};
