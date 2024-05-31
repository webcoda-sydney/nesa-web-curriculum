import type { UiCardNewsletterSubscription } from '@/kontent/content-types/ui_card_newsletter_subscription'
import LegacyNewsletterSubscribeBox from '@/legacy-ported/components/teachers/NewsletterSubscribeBox'

export interface NewsletterSubscribeBoxProps {
	section: UiCardNewsletterSubscription
}

export const NewsletterSubscribeBox = (props: NewsletterSubscribeBoxProps) => {
	const { section, ...rest } = props

	return (
		<LegacyNewsletterSubscribeBox
			{...rest}
			title={section.elements.title.value}
			inputLabel={section.elements.input_label.value}
			buttonLabel={section.elements.button_label.value}
			formAction={section.elements.createsend_action.value}
			createSendId={section.elements.createsend_id.value}
		/>
	)
}

export default NewsletterSubscribeBox
