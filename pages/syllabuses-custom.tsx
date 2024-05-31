import { CustomSyllabusPage } from '@/components/CustomSyllabusPage'
import { TAXO_TERM_LIFE_SKILLS } from '@/constants'
import { Glossary, Syllabus } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { taxonomies as projectTaxonomies } from '@/kontent/project/taxonomies'
import { TaxoStage } from '@/kontent/taxonomies'
import { UrlLink } from '@/legacy-ported/utilities/frontendTypes'
import {
	getAllItemsByType,
	getCachedAssets,
	getSiteMappings,
	loadWebsiteConfig,
} from '@/lib/api'
import { CommonPageProps, KontentCurriculumCommonResultData } from '@/types'
import {
	convertProjectModelTaxonomiesToElementModelsTaxonomyTerm,
	excludeAceGlossaries,
	excludeUnstagedSyllabusesTagsFromGlossaries,
	isAllowPreviewExternalSyllabus,
	isShowPublished,
} from '@/utils'
import { cleanJson } from '@/utils/cleanJson'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import Head from 'next/head'
import { NextRouter } from 'next/router'
import type { GetStaticProps, InferGetStaticPropsType } from 'next/types'

export type StageWithSyllabuses = ElementModels.TaxonomyTerm<TaxoStage> & {
	syllabuses: Syllabus[]
}

export const getQueryOnlyFromRouter = (router: NextRouter): string => {
	const regexRootPath = new RegExp(`^${router.pathname}`, '')
	return router.asPath.replace(regexRootPath, '')
}

export const getQueriesAsCommaSeparatedStr = (query: string | object) => {
	let result = ''
	if (Array.isArray(query)) {
		result = query.join(',')
	}
	if (typeof query === 'object') {
		result = Object.values(query).join(',')
	}
	return result
}

export default function CustomSyllabus(
	props: CommonPageProps<any, KontentCurriculumCommonResultData<any>>,
) {
	return (
		<>
			<Head>
				<link
					key="canonical"
					rel="canonical"
					href="/syllabuses-custom"
				/>
				<meta key="robots" name="robots" content="noindex,nofollow" />
			</Head>
			<CustomSyllabusPage {...props}></CustomSyllabusPage>
		</>
	)
}
export const getStaticProps: GetStaticProps<
	CommonPageProps<any, any> & { breadcrumbLinks: UrlLink[] }
> = async ({ preview = false, previewData = {}, params }) => {
	const _isAllowPreviewExternalSyllabus = isAllowPreviewExternalSyllabus()
	const isGetPreviewContent = !isShowPublished(previewData) && preview

	const assets = await getCachedAssets(isGetPreviewContent)

	let [config, mappings, glossaries, syllabuses] = await Promise.all([
		loadWebsiteConfig(isGetPreviewContent),
		getSiteMappings(isGetPreviewContent),
		getAllItemsByType<Glossary>({
			type: contentTypes.glossary.codename,
			preview,
			depth: 0,
		}),
		getAllItemsByType<Syllabus>({
			type: contentTypes.syllabus.codename,
			depth: 0,
			preview,
			elementsParameter: [
				contentTypes.syllabus.elements.title.codename,
				contentTypes.syllabus.elements.key_learning_area__items
					.codename,
				contentTypes.syllabus.elements.stages__stages.codename,
				contentTypes.syllabus.elements.syllabus.codename,
				contentTypes.syllabus.elements.code.codename,
				contentTypes.syllabus.elements.redirecturl.codename,
				contentTypes.syllabus.elements.doredirect.codename,
				contentTypes.syllabus.elements.implementation_title.codename,
				contentTypes.syllabus.elements.implementation_info.codename,
				contentTypes.syllabus.elements.web_content_rtb__content
					.codename,
				contentTypes.syllabus.elements.syllabus_type__items.codename,
				contentTypes.syllabus.elements.allowpreview.codename,
				contentTypes.syllabus.elements.languages.codename,
			],
			allFilter: _isAllowPreviewExternalSyllabus
				? null
				: {
						element: `elements.${contentTypes.syllabus.elements.doredirect.codename}`,
						value: ['no'],
				  },
		}),
	])

	/** This breadcrumbLinks is to be passed to NavPage for breadcrumb to work */
	const breadcrumbLinks: UrlLink[] = [
		{
			title: 'Home',
			url: '/',
		},
		{
			title: 'Custom Syllabus',
			url: undefined,
		},
	]

	const _props: InferGetStaticPropsType<typeof getStaticProps> = {
		mappings,
		preview,
		previewData,
		data: {
			config,
			stages: null,
			stageGroups: null,
			keyLearningAreas: null,
			assets: null,
			glossaries: null,
			syllabuses: null,
		},
		params: {
			...params,
			pageTitle: 'Custom syllabus view',
			isCanonical: true,
			slug: [],
		},
		breadcrumbLinks,
	}

	_props.data.stages = [
		...convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.stage,
		),
		TAXO_TERM_LIFE_SKILLS,
	]
	_props.data.stageGroups =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.stage_group,
		)
	_props.data.keyLearningAreas =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.key_learning_area,
		)
	_props.data.assets = assets.filter(
		(asset) =>
			asset.resource_type.length &&
			asset.resource_type.every((rt) => !rt.codename.includes('ace_')),
	)
	_props.data.syllabuses = syllabuses
	_props.data.glossaries = excludeUnstagedSyllabusesTagsFromGlossaries(
		excludeAceGlossaries(glossaries),
		_props.data.syllabuses.items,
	)
	_props.rootLayoutClassName = 'max-w-none mx-0 px-0 !pt-0'

	return {
		props: {
			...cleanJson(_props),
		},
	}
}
