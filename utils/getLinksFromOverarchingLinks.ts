import { LinkProps } from '@/components/Link'
import { getLinkedItems } from '@/components/contexts/KontentHomeConfigProvider'
import {
	Contentgroup,
	Focusarea,
	Syllabus,
	Teachingadvice,
	WebLinkContentgroup,
	WebLinkFocusarea,
	WebLinkTeachingadvice,
} from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { getAllItemsByTypeV2 } from '@/lib/api'
import { Elements, IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import { GetStaticPropsResult, InferGetStaticPropsType } from 'next'
import { byIContentItemCodename } from '.'
import { getStaticProps as gspWebLinkContentGroup } from '../pages/page-api/web_link_contentgroup/[codename]'
import { getStaticProps as gspWebLinkFocusArea } from '../pages/page-api/web_link_focusarea/[codename]'
import { getStaticProps as gspWebLinkTeachingAdvice } from '../pages/page-api/web_link_teachingadvice/[codename]'
import { isWebLinkFocusarea, isWebLinkTeachingadvice } from './type_predicates'

export type TOverarchingLink =
	| WebLinkFocusarea
	| WebLinkContentgroup
	| WebLinkTeachingadvice
export type TOverarchingLinkItem = Focusarea | Teachingadvice | Contentgroup

export type TOverarchingLinkProps = LinkProps & {
	overarchingLinkItem: TOverarchingLink
}

export type TGspProps<T> = GetStaticPropsResult<T> & { props: T }

export const getLinksFromOverarchingLinks = async (
	overarchingLinks: Elements.LinkedItemsElement<TOverarchingLink>,
	linkedItems: IContentItemsContainer,
	_currentStageOrYear: unknown,
	preview: boolean = false,
): Promise<TOverarchingLinkProps[]> => {
	const _overarchingLinks = getLinkedItems(overarchingLinks, linkedItems)

	const [_overarchingSyllabuses] = await Promise.all([
		getAllItemsByTypeV2<Syllabus>({
			type: contentTypes.syllabus.codename,
			preview,
			moreQueryFn: (query) => {
				return query.allFilter(
					`elements.${contentTypes.syllabus.elements.syllabus.codename}`,
					_overarchingLinks.map(byIContentItemCodename),
				)
			},
		}),
	])

	const expandedOverarchingLinkItems = await Promise.all(
		_overarchingLinks.map(async (link) => {
			let result: TGspProps<
				InferGetStaticPropsType<
					| typeof gspWebLinkFocusArea
					| typeof gspWebLinkTeachingAdvice
					| typeof gspWebLinkContentGroup
				>
			> | null = null
			if (isWebLinkFocusarea(link)) {
				result = (await gspWebLinkFocusArea({
					params: {
						codename: link.system.codename,
					},
					preview,
				})) as TGspProps<
					InferGetStaticPropsType<typeof gspWebLinkFocusArea>
				>
			} else if (isWebLinkTeachingadvice(link)) {
				result = (await gspWebLinkTeachingAdvice({
					params: { codename: link.system.codename },
					preview,
				})) as TGspProps<
					InferGetStaticPropsType<typeof gspWebLinkTeachingAdvice>
				>
			} else {
				result = (await gspWebLinkContentGroup({
					params: { codename: link.system.codename },
					preview,
				})) as TGspProps<
					InferGetStaticPropsType<typeof gspWebLinkContentGroup>
				>
			}
			return {
				url: result.props.url,
				link,
			}
		}),
	)
	return expandedOverarchingLinkItems.map((linkItem) => {
		return {
			href: linkItem.url,
			overarchingLinkItem: linkItem.link,
		} as TOverarchingLinkProps
	})
}
