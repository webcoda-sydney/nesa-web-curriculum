import { WebLinkSyllabus as TWebLinkSyllabus } from '@/kontent/content-types'
import { getSlugByCodename } from '@/utils'
import getUrlFromMapping from '@/utils/getUrlFromMapping'
import Link from 'next/link'
import { RichtextSectionProps } from '.'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '../contexts/KontentHomeConfigProvider'

const WebLinkSyllabus = ({
	mappings,
	linkedItem,
}: RichtextSectionProps<TWebLinkSyllabus>) => {
	const { pageResponseLinkedItems } = useKontentHomeConfig()
	const itemCodename = getLinkedItems(
		linkedItem.elements.item,
		pageResponseLinkedItems,
	)?.[0]?.system?.codename
	let tab =
		getSlugByCodename(linkedItem.elements.tab?.value?.[0]?.codename) ||
		'overview'
	if (tab === 'course-overview') tab = 'overview'

	const _url = getUrlFromMapping(mappings, itemCodename)
	const url = _url + `/${tab}`
	return (
		<Link href={url}>
			<a>{linkedItem.elements.title.value}</a>
		</Link>
	)
}

export default WebLinkSyllabus
