import { Weblinkint as TWeblinkint } from '@/kontent/content-types'
import getUrlFromMapping from '@/utils/getUrlFromMapping'
import Link from 'next/link'
import { RichtextSectionProps } from '.'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '../contexts/KontentHomeConfigProvider'

const WebLinkInternal = ({
	mappings,
	linkedItem,
}: RichtextSectionProps<TWeblinkint>) => {
	const { pageResponseLinkedItems } = useKontentHomeConfig()
	const itemCodename = getLinkedItems(
		linkedItem.elements.item,
		pageResponseLinkedItems,
	)?.[0]?.system?.codename

	const url = getUrlFromMapping(mappings, itemCodename)
	if (!url) {
		return <span>{linkedItem.elements.title.value}</span>
	}
	return (
		<Link href={url}>
			<a>{linkedItem.elements.title.value}</a>
		</Link>
	)
}

export default WebLinkInternal
