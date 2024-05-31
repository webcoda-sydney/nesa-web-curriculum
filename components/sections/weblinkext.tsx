import { Weblinkext } from '@/kontent/content-types'
import { RichtextSectionProps } from '.'

const web_link_external = ({
	linkedItem,
}: RichtextSectionProps<Weblinkext>) => {
	return (
		<a
			target="_blank"
			href={linkedItem.elements.link_url.value}
			rel="noreferrer"
		>
			{linkedItem.elements.title.value}
		</a>
	)
}

export default web_link_external
