import type { UiMenu } from '@/kontent/content-types/ui_menu'
import type { RichtextSectionProps } from '.'

export default function ui_menu(props: RichtextSectionProps<UiMenu>) {
	const { linkedItem } = props

	return (
		<div className="ui_menu">
			{linkedItem.elements.title.value}
			{linkedItem.elements.subtitle.value}
		</div>
	)
}
