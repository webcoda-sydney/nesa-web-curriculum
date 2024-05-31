const { DeliveryClient } = require('@kontent-ai/delivery-sdk')
const packageInfo = require('./package.json')

const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production'

const kontentClient = new DeliveryClient({
	projectId: process.env.NEXT_PUBLIC_KONTENT_PROJECT_ID,
	previewApiKey: process.env.KONTENT_PREVIEW_API_KEY,
	globalHeaders: (_queryConfig) => [
		{
			header: 'X-KC-SOURCE',
			value: `${packageInfo.name};${packageInfo.version}`,
		},
	],
	assetsDomain: process.env.NEXT_PUBLIC_ASSETS_BASE_PATH,
})

const getSlugByCodename = (codename) => codename.replace(/_/g, '-')

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
	// https://github.com/vercel/next.js/issues/21079
	images: {
		loader: 'custom',
	},
	// api: {
	// 	resposeLimit: '4.5mb',
	// },
	env: {
		// Add any logic you want here, returning `true` to enable password protect.
		PASSWORD_PROTECT:
			typeof process.env.PASSWORD_PROTECT === 'string'
				? process.env.PASSWORD_PROTECT === 'true'
				: true,
	},
	// target: 'serverless',
	productionBrowserSourceMaps: !isProduction,
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			type: 'asset/resource',
		})

		return config
	},
	async headers() {
		const headers = []
		if (isProduction) {
			headers.push({
				headers: [
					{
						key: 'X-Robots-Tag',
						value: 'noindex',
					},
				],
				source: '/:path*',
			})
		}
		return headers
	},
	async redirects() {
		const [redirectRules] = await Promise.all([
			kontentClient
				.items()
				.type('redirectrule')
				.depthParameter(0)
				.toAllPromise((result) => result.data),
		])

		// New redirect from CMS
		/**@type {import('next/dist/lib/load-custom-routes').Redirect[]} */
		const result = redirectRules.data.items
			.filter((_redirectRule) => {
				/**@type import('./kontent/content-types/redirectrule').Redirectrule */
				const redirectRule = _redirectRule

				/**@type import('./utils/redirectrules').RedirectRulesType */
				return redirectRule.elements.type.value[0].codename
			})
			.flatMap((_redirectRule) => {
				/**@type import('./kontent/content-types/redirectrule').Redirectrule */
				const redirectRule = _redirectRule

				/**@type import('./utils/redirectrules').RedirectRulesType */
				const type = redirectRule.elements.type.value[0].codename

				const fromSlug = getSlugByCodename(
					redirectRule.elements.from.value,
				)
				const toSlug = getSlugByCodename(redirectRule.elements.to.value)

				switch (type) {
					case 'syllabus_codename': {
						return [
							{
								source: `/learning-areas/:kla/${fromSlug}`,
								destination: `/learning-areas/:kla/${toSlug}`,
								permanent: true,
							},
						]
					}
					case 'focus_area_codename': {
						return [
							{
								source: `/learning-areas/:kla/:syl/:tab/:stageOrYear/${fromSlug}`,
								destination: `/learning-areas/:kla/:syl/:tab/:stageOrYear/${toSlug}`,
								permanent: true,
							},
						]
					}
					default: {
						return {
							source: redirectRule.elements.from.value,
							destination: redirectRule.elements.to.value,
							permanent: true,
						}
					}
				}
			})

		console.log('🚀 ~ file: next.config.js:134 ~ Redirect Rules:', result)

		return result
	},
	generateBuildId() {
		return (
			process.env.NEXT_PUBLIC_BUILD_ID ||
			process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
		)
	},
	experimental: {
		largePageDataBytes: 4.5 * 1024 * 1024, // Set to 4.5MB
	},
}
