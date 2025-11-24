import type { FetchImplementation } from './FetchImplementation.ts'

export const fetchWithDebug: (
	log?: (type: 'request' | 'response', details: any) => void,
	error?: (details: any) => void,
	body?: (body: any) => void,
) => FetchImplementation =
	(log = console.log, logError = console.error, body = console.debug) =>
	async (url, options) => {
		// Log request details
		log('request', {
			url: url.toString(),
			method: options?.method ?? 'GET',
			headers: options?.headers,
			body: options?.body,
			...(options?.signal !== undefined && { signal: 'AbortSignal provided' }),
			...(options?.credentials !== undefined && {
				credentials: options.credentials,
			}),
			...(options?.cache !== undefined && { cache: options.cache }),
			...(options?.redirect !== undefined && { redirect: options.redirect }),
			...(options?.referrer !== undefined && { referrer: options.referrer }),
			...(options?.referrerPolicy !== undefined && {
				referrerPolicy: options.referrerPolicy,
			}),
			...(options?.integrity !== undefined && { integrity: options.integrity }),
			...(options?.keepalive !== undefined && { keepalive: options.keepalive }),
			...(options?.mode !== undefined && { mode: options.mode }),
		})

		const startTime = Date.now()

		try {
			const response = await fetch(url, options)
			const duration = Date.now() - startTime

			// Log response details
			log('response', {
				url: url.toString(),
				status: response.status,
				statusText: response.statusText,
				ok: response.ok,
				headers: Object.fromEntries(response.headers.entries()),
				duration: `${duration}ms`,
				type: response.type,
				redirected: response.redirected,
				...(response.url !== url.toString() && { finalUrl: response.url }),
			})

			// eslint-disable-next-line @typescript-eslint/unbound-method
			const originalTextBody = response.text
			// eslint-disable-next-line @typescript-eslint/unbound-method
			const originalJSONBody = response.json
			// eslint-disable-next-line @typescript-eslint/unbound-method
			const originalArrayBufferBody = response.arrayBuffer

			response.text = async () => {
				const textBody = await originalTextBody.call(response)
				body(textBody)
				return textBody
			}

			response.json = async () => {
				const jsonBody = await originalJSONBody.call(response)
				body(jsonBody)
				return jsonBody
			}

			response.arrayBuffer = async () => {
				const arrayBufferBody = await originalArrayBufferBody.call(response)
				body(arrayBufferBody)
				return arrayBufferBody
			}

			return response
		} catch (error) {
			const duration = Date.now() - startTime

			// Log error details
			logError({
				url: url.toString(),
				duration: `${duration}ms`,
				error:
					error instanceof Error
						? {
								name: error.name,
								message: error.message,
								...(error.cause !== undefined &&
								typeof error.cause === 'object' &&
								error.cause !== null
									? { cause: error.cause }
									: {}),
							}
						: error,
			})

			throw error
		}
	}
