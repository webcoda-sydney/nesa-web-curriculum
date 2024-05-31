import { pathToRegexp } from 'path-to-regexp'
import makeMatcher from 'wouter/matcher'

export const getDefaultRoutes = () => [
	{
		pattern:
			'/learning-areas/:learningarea/:syllabus/:tab/:stageOrYear/:focusarea',
	},
	{
		pattern: '/learning-areas/:learningarea/:syllabus/:tab/:stageOrYear',
	},
	{
		pattern: '/learning-areas/:learningarea/:syllabus/:tab',
	},
	{
		pattern: '/learning-areas/:learningarea/:syllabus',
	},
	{
		pattern: '/learning-areas/:learningarea',
	},
	{
		pattern: '/syllabuses/:syllabus',
	},
]

export const routeMatcher = makeMatcher((path) => {
	let keys = []
	const regexp = pathToRegexp(path, keys, { strict: false })
	return { keys, regexp }
})

// Function to match a URL with routes and extract parameters
export function matchRoute(url, routes = getDefaultRoutes()) {
	for (const route of routes) {
		const [match, params] = routeMatcher(route.pattern, url)

		if (match) {
			return {
				params,
			}
		}
	}

	return null // No match found
}
