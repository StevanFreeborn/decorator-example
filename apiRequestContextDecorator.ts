import { APIRequestContext, APIResponse, Request } from "@playwright/test";
import { ReadStream } from "fs";
import { Serializable } from "playwright-core/types/structs";

type APIRequestOptions = {
  data?: string | Buffer | Serializable;
  failOnStatusCode?: boolean;
  form?: { [key: string]: string | number | boolean } | FormData;
  headers?: { [key: string]: string };
  ignoreHTTPSErrors?: boolean;
  maxRedirects?: number;
  maxRetries?: number;
  multipart?:
    | FormData
    | {
        [key: string]:
          | string
          | number
          | boolean
          | ReadStream
          | { name: string; mimeType: string; buffer: Buffer };
      };
  params?:
    | { [key: string]: string | number | boolean }
    | URLSearchParams
    | string;
  timeout?: number;
};

export class APIRequestContextDecorator implements APIRequestContext {
  private readonly _context: APIRequestContext;
  private readonly _responseCallbacks: Array<
    (response: APIResponse) => Promise<void> | void
  >;

  constructor(context: APIRequestContext) {
    this._context = context;
    this._responseCallbacks = [];
  }

  private async handleResponse(response: APIResponse) {
    for (const cb of this._responseCallbacks) {
      await cb(response);
    }
  }

  onResponse(callback: (response: APIResponse) => Promise<void> | void) {
    this._responseCallbacks.push(callback);
  }

  async fetch(
    urlOrRequest: string | Request,
    options?: APIRequestOptions,
  ): Promise<APIResponse> {
    const response = await this._context.fetch(urlOrRequest, options);
    await this.handleResponse(response);
    return response;
  }

  async delete(url: string, options?: APIRequestOptions): Promise<APIResponse> {
    const response = await this._context.delete(url, options);
    await this.handleResponse(response);
    return response;
  }

  async get(url: string, options?: APIRequestOptions): Promise<APIResponse> {
    const response = await this._context.get(url, options);
    await this.handleResponse(response);
    return response;
  }

  async head(url: string, options?: APIRequestOptions): Promise<APIResponse> {
    const response = await this._context.head(url, options);
    await this.handleResponse(response);
    return response;
  }

  async patch(url: string, options?: APIRequestOptions): Promise<APIResponse> {
    const response = await this._context.patch(url, options);
    await this.handleResponse(response);
    return response;
  }

  async post(url: string, options?: APIRequestOptions): Promise<APIResponse> {
    const response = await this._context.post(url, options);
    await this.handleResponse(response);
    return response;
  }

  async put(url: string, options?: APIRequestOptions): Promise<APIResponse> {
    const response = await this._context.put(url, options);
    await this.handleResponse(response);
    return response;
  }

  storageState(options?: { indexedDB?: boolean; path?: string }): Promise<{
    cookies: Array<{
      name: string;
      value: string;
      domain: string;
      path: string;
      expires: number;
      httpOnly: boolean;
      secure: boolean;
      sameSite: "Strict" | "Lax" | "None";
    }>;
    origins: Array<{
      origin: string;
      localStorage: Array<{ name: string; value: string }>;
    }>;
  }> {
    return this.storageState(options);
  }

  dispose(options?: { reason?: string }): Promise<void> {
    return this._context.dispose(options);
  }

  [Symbol.asyncDispose](): Promise<void> {
    return this[Symbol.asyncDispose]();
  }
}
