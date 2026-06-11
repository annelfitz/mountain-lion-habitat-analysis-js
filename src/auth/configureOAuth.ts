/*
Copyright 2026 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import esriConfig from "@arcgis/core/config";
import esriId from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";

export interface OAuthConfig {
  portalUrl?: string;
  appId: string;
  // If true, you'll need to implement oauth callback logic manually
  // See: https://github.com/Esri/jsapi-resources/tree/main/oauth
  popup?: boolean;
}

export function configureOAuth({ portalUrl, appId, popup = false }: OAuthConfig): void {
  if (portalUrl) {
    esriConfig.portalUrl = portalUrl;
  }

  const oAuthInfo = portalUrl
    ? new OAuthInfo({
        appId,
        portalUrl,
        popup,
      })
    : new OAuthInfo({
        appId,
        popup,
      });

  esriId.registerOAuthInfos([oAuthInfo]);
}
