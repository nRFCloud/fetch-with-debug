import nock from 'nock'
import assert from 'node:assert'
import { describe, it, mock } from 'node:test'
import { fetchWithDebug } from './fetchWithDebug.ts'

void describe('fetchWithDebug', (): void => {
	void it('should debug a request', async () => {
		const scope = nock('https://example.com').post('/foo').reply(
			200,
			{ foo: 'bar' },
			{
				'Content-Type': 'application/json',
			},
		)

		const mockLog = mock.fn()
		const mockError = mock.fn()
		const mockBody = mock.fn()

		const res = await fetchWithDebug(
			mockLog,
			mockError,
			mockBody,
		)(new URL('https://example.com/foo'), {
			method: 'POST',
			body: JSON.stringify({ bar: 'baz' }),
			headers: {
				'Content-Type': 'application/json',
			},
		})

		assert.equal(res.status, 200)
		assert.deepEqual(await res.json(), { foo: 'bar' })

		const requestLog = mockLog.mock.calls.find(
			(call) => call.arguments[0] === 'request',
		)
		const responseLog = mockLog.mock.calls.find(
			(call) => call.arguments[0] === 'response',
		)

		assert.ok(requestLog)
		assert.ok(responseLog)

		assert.deepEqual(requestLog?.arguments[1], {
			url: 'https://example.com/foo',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ bar: 'baz' }),
		})

		assert.partialDeepStrictEqual(responseLog?.arguments[1], {
			url: 'https://example.com/foo',
			status: 200,
			ok: true,
			headers: {},
		})

		assert.deepEqual(mockBody.mock.calls[0]?.arguments[0], { foo: 'bar' })

		assert.ok(scope.isDone())
	})
})
