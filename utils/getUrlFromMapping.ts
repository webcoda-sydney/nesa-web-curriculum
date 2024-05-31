import type { Mapping } from '@/types'

export function getUrlFromSlugs(
	slugs: string[],
	additional = '',
	basePath = '/',
) {
	const path = slugs.join('/')
	return basePath + path + additional
}

export function getMappingByCodename(mappings: Mapping[], codename: string) {
	return mappings.find((_mapping) => {
		return _mapping.params.navigationItem?.codename === codename
	})
}

export default function getUrlFromMapping(
	mappings: Mapping[],
	codename: string,
) {
	const mapping = getMappingByCodename(mappings, codename)

	if (!mapping) {
		return undefined
	}

	return getUrlFromSlugs(mapping.params.slug, mapping.params.additional)
}
