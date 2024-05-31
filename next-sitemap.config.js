const { minimatch } = require('minimatch')
const {
	getPathsForSyllabus,
	getDefaultSlugPaths,
} = require('./utils-js/sitemap')
// need to get the paths manually since the paths are not pre-generated

/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
	generateRobotsTxt: true, // (optional)
	exclude: [
		'/basicauth',
		'/syllabuses-custom',
		'/page-api/*',
		'/learning-areas/*/*/content/*',
		'/404',
		'/resources/record-of-changes/*',
	],
	robotsTxtOptions: {
		policies: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/*.docx$', '/*.pdf$', '/*.zip$'],
			},
		],
	},
	additionalPaths: async (config) => {
		// paths for [[...slug]].tsx
		const defaultSlugPaths = getDefaultSlugPaths(config)
		// paths for /learning-areas/[learningarea]/[syllabus]/[tab].tsx
		const pathForSyllabus = await getPathsForSyllabus()

		const finalPaths = await Promise.all(
			[...defaultSlugPaths, ...pathForSyllabus]
				.filter((path) => {
					const isExcluded = config.exclude.some((pattern) =>
						minimatch(path, pattern),
					)
					return !isExcluded
				})
				.map(async (path) => {
					return await config.transform(config, path)
				}),
		)

		return finalPaths
	},
	// ...other options
}
