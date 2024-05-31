export const axiosSureThing = <T extends { data: object }>(
	promise: Promise<T>,
) =>
	promise
		.then(({ data }) => ({ ok: true, data }))
		.catch((error) =>
			Promise.resolve({ ok: false, data: error?.response?.data, error }),
		)

const _ = <T>(promise: Promise<T>) => {
	return promise
		.then((response) => ({ ok: true, response }))
		.catch((error) => Promise.resolve({ ok: false, error }))
}

export default _
