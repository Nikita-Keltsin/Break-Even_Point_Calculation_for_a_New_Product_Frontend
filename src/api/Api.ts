/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ApiBreakEvenPointFeedJSON {
  /** null у черновика */
  amount_monthly?: number;
  cost_name?: string;
  created_at?: string;
  creator_id?: number;
  /** null у черновика */
  formed_at?: string;
  id?: number;
  /** "" → клиент показывает фото по умолчанию */
  image_url?: string;
  /** null у черновика */
  is_fixed?: boolean;
  is_liked?: number;
  likes_count?: number;
  /** null у черновика */
  short_description?: string;
  /** "" → клиент показывает видео по умолчанию */
  video_url?: string;
}

export interface ApiBreakEvenPointJSON {
  /** null у черновика */
  amount_monthly?: number;
  cost_name?: string;
  created_at?: string;
  creator_id?: number;
  /** null у черновика */
  formed_at?: string;
  id?: number;
  /** "" → клиент показывает фото по умолчанию */
  image_url?: string;
  /** null у черновика */
  is_fixed?: boolean;
  likes_count?: number;
  /** null у черновика */
  short_description?: string;
  /** "" → клиент показывает видео по умолчанию */
  video_url?: string;
}

export interface ApiBreakEvenPointListJSON {
  /** null у черновика */
  amount_monthly?: number;
  cost_name?: string;
  created_at?: string;
  creator_id?: number;
  /** null у черновика */
  formed_at?: string;
  id?: number;
  /** "" → клиент показывает фото по умолчанию */
  image_url?: string;
  /** null у черновика */
  is_fixed?: boolean;
  is_mine?: number;
  likes_count?: number;
  /** null у черновика */
  short_description?: string;
  /** "" → клиент показывает видео по умолчанию */
  video_url?: string;
}

export interface ApiLikeRequest {
  like: number;
}

export interface ApiLikeResponse {
  is_liked?: number;
  likes_count?: number;
}

export interface ApiLoginRequest {
  password: string;
  username: string;
}

export interface ApiLoginResponse {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface ApiPublishRequest {
  amount_monthly: number;
  is_fixed: boolean;
  short_description: string;
}

export interface ApiRegisterRequest {
  password: string;
  username: string;
}

export interface ApiUserJSON {
  id?: number;
  username?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title breakeven_point API
 * @version 1.0
 * @contact
 *
 * Веб-сервис расчёта точки безубыточности нового продукта: виды затрат (домен breakeven_point) и пользователи (домен users).
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Только опубликованные. Фильтрация на бэкенде. Доступно всем; с токеном заполняется is_mine (своя карточка).
     *
     * @tags breakeven_point
     * @name BreakevenPointList
     * @summary Список видов затрат с фильтром
     * @request GET:/api/breakeven_point
     */
    breakevenPointList: (
      query?: {
        /** Сумма от, ₽/мес */
        min_amount?: number;
        /** Сумма до, ₽/мес */
        max_amount?: number;
        /** 1 — постоянные, 0 — переменные */
        is_fixed?: 0 | 1;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiBreakEvenPointListJSON[], any>({
        path: `/api/breakeven_point`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Файлы сохраняются в MinIO под латинскими именами; создатель — пользователь из JWT. Доступно создателю.
     *
     * @tags breakeven_point
     * @name BreakevenPointCreate
     * @summary Создать вид затрат (черновик) с фото и видео
     * @request POST:/api/breakeven_point
     * @secure
     */
    breakevenPointCreate: (
      data: {
        /** Название */
        name: string;
        /**
         * Фото
         * @format binary
         */
        image?: File;
        /**
         * Видео
         * @format binary
         */
        video?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiBreakEvenPointJSON, void>({
        path: `/api/breakeven_point`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Не более одного черновика у пользователя, id не передаётся. Доступно создателю.
     *
     * @tags breakeven_point
     * @name BreakevenPointDraftList
     * @summary Черновик текущего пользователя
     * @request GET:/api/breakeven_point/draft
     * @secure
     */
    breakevenPointDraftList: (params: RequestParams = {}) =>
      this.request<ApiBreakEvenPointJSON, void>({
        path: `/api/breakeven_point/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Без id — первый опубликованный; с id — по id; с id и next=true — следующий после id. В ответе is_liked = 0/1 — лайк текущего пользователя. Доступно всем.
     *
     * @tags breakeven_point
     * @name BreakevenPointFeedList
     * @summary Лента: один вид затрат
     * @request GET:/api/breakeven_point/feed
     */
    breakevenPointFeedList: (
      query?: {
        /** id вида затрат */
        id?: number;
        /** true — следующий после id */
        next?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiBreakEvenPointFeedJSON, void>({
        path: `/api/breakeven_point/feed`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags breakeven_point
     * @name BreakevenPointDelete
     * @summary Удалить свой вид затрат (soft delete)
     * @request DELETE:/api/breakeven_point/{id}
     * @secure
     */
    breakevenPointDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/breakeven_point/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description like = 1 ставит лайк текущего пользователя, like = 0 отменяет. Доступно создателю.
     *
     * @tags breakeven_point
     * @name BreakevenPointLikeCreate
     * @summary Поставить или отменить лайк
     * @request POST:/api/breakeven_point/{id}/like
     * @secure
     */
    breakevenPointLikeCreate: (
      id: number,
      body: ApiLikeRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiLikeResponse, void>({
        path: `/api/breakeven_point/${id}/like`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description draft → published: краткое описание и 2 поля по теме, formed_at. Вернуть в черновик нельзя. Доступно создателю.
     *
     * @tags breakeven_point
     * @name BreakevenPointPublishUpdate
     * @summary Опубликовать свой черновик
     * @request PUT:/api/breakeven_point/{id}/publish
     * @secure
     */
    breakevenPointPublishUpdate: (
      id: number,
      body: ApiPublishRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiBreakEvenPointJSON, void>({
        path: `/api/breakeven_point/${id}/publish`,
        method: "PUT",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Проверяет логин и пароль (bcrypt) и выдаёт JWT. Доступно всем.
     *
     * @tags users
     * @name UsersLoginCreate
     * @summary Аутентификация пользователя
     * @request POST:/api/users/login
     */
    usersLoginCreate: (body: ApiLoginRequest, params: RequestParams = {}) =>
      this.request<ApiLoginResponse, void>({
        path: `/api/users/login`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Кладёт jti текущего JWT в blacklist Redis до окончания срока его действия. Доступно создателю.
     *
     * @tags users
     * @name UsersLogoutCreate
     * @summary Деавторизация пользователя
     * @request POST:/api/users/logout
     * @secure
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/users/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Пароль хранится bcrypt-хэшем. Доступно всем.
     *
     * @tags users
     * @name UsersRegisterCreate
     * @summary Регистрация пользователя
     * @request POST:/api/users/register
     */
    usersRegisterCreate: (
      body: ApiRegisterRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiUserJSON, void>({
        path: `/api/users/register`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
