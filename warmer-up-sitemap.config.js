const { minimatch } = require('minimatch')
const {
	getPathsForSyllabus,
	getDefaultSlugPaths,
	getPathsForFocusArea,
} = require('./utils-js/sitemap')
// need to get the paths manually since the paths are not pre-generated

/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
	generateIndexSitemap: false,
	sitemapBaseFileName: 'sitemap-warmup',
	exclude: ['/basicauth', '/syllabuses-custom', '/404'],
	additionalPaths: async (config) => {
		// paths for [[...slug]].tsx
		const defaultSlugPaths = getDefaultSlugPaths(config)
		// paths for /learning-areas/[learningarea]/[syllabus]/[tab].tsx
		const pathForSyllabus = await getPathsForSyllabus()
		const pathForFocusareas = await getPathsForFocusArea()

		const finalPaths = await Promise.all(
			[...defaultSlugPaths, ...pathForSyllabus, ...pathForFocusareas]
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
