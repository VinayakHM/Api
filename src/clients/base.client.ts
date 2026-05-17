import type { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import type { ApiResponse, HttpMethod, RequestOptions } from '../types/http';

/**
 * BaseClient wraps Playwright's APIRequestContext and adds:
 *  - structured logging (request + response + duration)
 *  - consistent ApiResponse<T> shape (status, body, headers, duration)
 *  - typed query-param + auth handling
 *
 * Resource clients extend this and expose domain methods (e.g. getUser, createPost).
 */
export class BaseClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly basePath = '',
  ) {}

  protected authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (env.AUTH_TOKEN) headers.Authorization = `Bearer ${env.AUTH_TOKEN}`;
    if (env.API_KEY) headers['x-api-key'] = env.API_KEY;
    return headers;
  }

  protected buildUrl(path: string, params?: RequestOptions['params']): string {
    const url = `${this.basePath}${path}`;
    if (!params) return url;

    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) search.append(k, String(v));
    }

    const qs = search.toString();
    return qs ? `${url}?${qs}` : url;
  }

  async send<T = unknown>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, options.params);
    const headers = { ...this.authHeaders(), ...(options.headers ?? {}) };
    const start = Date.now();

    logger.info(`-> ${method} ${url}`, { headers: Object.keys(headers) });

    const response: APIResponse = await this.request.fetch(url, {
      method,
      headers,
      data: options.data as object | undefined,
      timeout: options.timeout ?? env.TIMEOUT,
    });

    const durationMs = Date.now() - start;
    const status = response.status();
    const body = await this.safeParseBody<T>(response);

    logger.info(`<- ${method} ${url} ${status} (${durationMs}ms)`);

    return {
      status,
      ok: response.ok(),
      headers: response.headers(),
      body,
      raw: response,
      durationMs,
    };
  }

  private async safeParseBody<T>(response: APIResponse): Promise<T> {
    const text = await response.text();
    if (!text) return undefined as unknown as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.send<T>('GET', path, options);
  }

  post<T>(path: string, options?: RequestOptions) {
    return this.send<T>('POST', path, options);
  }

  put<T>(path: string, options?: RequestOptions) {
    return this.send<T>('PUT', path, options);
  }

  patch<T>(path: string, options?: RequestOptions) {
    return this.send<T>('PATCH', path, options);
  }

  delete<T>(path: string, options?: RequestOptions) {
    return this.send<T>('DELETE', path, options);
  }
}