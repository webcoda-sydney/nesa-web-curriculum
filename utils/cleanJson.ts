import fastSafeStringify from 'fast-safe-stringify'

const replacer = (_, value) => {
	// Remove the circular structure
	if (value === '[Circular]') {
		return
	}
	return value
}

const prune = (obj, depth = 1) => {
	if (Array.isArray(obj) && obj.length > 0) {
		return depth === 0 ? ['???'] : obj.map((e) => prune(e, depth - 1))
	} else if (obj && typeof obj === 'object' && Object.keys(obj).length > 0) {
		return depth === 0
			? { '???': '' }
			: Object.keys(obj).reduce(
					(acc, key) => ({
						...acc,
						[key]: prune(obj[key], depth - 1),
					}),
					{},
			  )
	} else {
		return obj
	}
}

const stringify = (obj, depth = 1, space) =>
	JSON.stringify(prune(obj, depth), null, space)

/**
 * Return
 * @param object object
 * @param depthLimit depth of json
 * @returns object
 */
export const cleanJson = (
	object,
	depthLimit = Number.MAX_SAFE_INTEGER,
	space = 0,
) => {
	return JSON.parse(
		stringify(
			JSON.parse(
				fastSafeStringify(object, replacer, space, {
					depthLimit: Number.MAX_SAFE_INTEGER,
					edgesLimit: Number.MAX_SAFE_INTEGER,
				}),
			),
			depthLimit,
			space,
		),
	)
}
