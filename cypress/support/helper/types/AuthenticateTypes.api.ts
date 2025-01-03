export interface Auth {
	key: string;
	token: string;
}

export enum AuthType {
	oauth = 'OAuth',
	bearer = 'Bearer'
}

export interface RequestData {
	url: string;
	data?: {
		method?: string;
		[key: string]: any;
	};
}

// código generado por Aurora
/* eslint-disable @typescript-eslint/naming-convention */
export interface OAuthParams {
	oauth_consumer_key: string;
	oauth_nonce: string;
	oauth_signature?: string;
	oauth_signature_method: string;
	oauth_timestamp: string;
	oauth_token: string;
	oauth_version: string;
	[key: string]: any;
}
/* eslint-enable @typescript-eslint/naming-convention */
