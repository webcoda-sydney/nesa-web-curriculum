import { AceGroup } from '@/kontent/content-types'
import type { WpAceLanding } from '@/kontent/content-types/wp_ace_landing'
import { contentTypes as projectContentTypes } from '@/kontent/project/contentTypes'
import { taxonomies as projectTaxonomies } from '@/kontent/project/taxonomies'
import { TaxoAceCategory } from '@/kontent/taxonomies'
import {
	getAllItemsByType,
	getItemByCodename,
	getNonLinkedItemsClient,
} from '@/lib/api'
import type { CommonPageProps } from '@/types'
import type { KontentCurriculumResultBaseData } from '@/types/index'
import { convertProjectModelTaxonomiesToElementModelsTaxonomyTerm } from '@/utils'
import type { ElementModels, Responses } from '@kontent-ai/delivery-sdk'
import type { DataBuilderBuildDataParams, GetPageResponseParams } from '.'

export interface WpResourcesResponseData
	extends KontentCurriculumResultBaseData<WpAceLanding> {
	aceGroups: Responses.IListContentItemsResponse<AceGroup>
	aceTaxos: ElementModels.TaxonomyTerm<TaxoAceCategory>[]
}

function getPageResponse({ codename, preview }: GetPageResponseParams) {
	return getItemByCodename<WpAceLanding>({
		depth: 1,
		codename,
		preview,
		kontentClient: getNonLinkedItemsClient(),
	})
}

async function buildData({
	result,
	pageResponse,
	preview = false,
}: DataBuilderBuildDataParams) {
	const _result: CommonPageProps<WpAceLanding, WpResourcesResponseData> = {
		...result,
		mappings: result.mappings,
		preview,
		previewData: null,
		data: {
			...result.data,
			pageResponse,
		},
	}

	const aceGroups = await getAllItemsByType<AceGroup>({
		type: projectContentTypes.ace_group.codename,
		depth: 3,
		preview,
		elementsParameter: [
			projectContentTypes.ace_group.elements.title.codename,
			projectContentTypes.ace_group.elements.code.codename,
			projectContentTypes.ace_group.elements.subgroups.codename,
			projectContentTypes.ace_subgroup.elements.rules.codename,
			projectContentTypes.ace_rule.elements.ace_category.codename,
		],
	})

	const aceTaxos: ElementModels.TaxonomyTerm<TaxoAceCategory>[] =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.ace_category,
		)
	_result.data.aceGroups = aceGroups
	_result.data.aceTaxos = aceTaxos
	_result.rootLayoutClassName =
		'max-w-none mx-0 px-0 !pt-0 !lg:pt-8 bg-[#fbfbfb]'

	return _result
}

const _ = {
	buildData,
	getPageResponse,
}

export default _
