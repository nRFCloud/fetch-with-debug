export type FetchImplementation = (
	url: URL,
	options?: Omit<RequestInit, 'headers'> & {
		headers?: Record<string, string>
	},
) => Promise<Response>
