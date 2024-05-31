import type { WpHomepage } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { getItemByCodename, getNonLinkedItemsClient } from '@/lib/api'
import type { DataBuilderBuildDataParams, GetPageResponseParams } from '.'

function getPageResponse({ codename, preview }: GetPageResponseParams) {
	return getItemByCodename<WpHomepage>({
		depth: 4,
		codename,
		preview,
		elementsParameter: [
			contentTypes.wp_homepage.elements.web_content_rtb__content.codename,
			contentTypes.wp_homepage.elements.hero_banner.codename,
			contentTypes.wp_homepage.elements.stages.codename,
			contentTypes.wp_homepage.elements.learning_areas.codename,
			contentTypes.wp_homepage.elements.teaching_and_learning.codename,
			contentTypes.wp_homepage.elements.seo__canonical_url.codename,
			contentTypes.wp_homepage.elements.seo__description.codename,
			contentTypes.wp_homepage.elements.seo__keywords.codename,
			contentTypes.wp_homepage.elements.seo__robots.codename,
			contentTypes.wp_homepage.elements.seo__title.codename,
			contentTypes.wp_homepage.elements.ace_rules.codename,

			// hero banner
			contentTypes.ui_herobanner.elements.items.codename,
			contentTypes.ui_herobanner.elements.display.codename,
			contentTypes.ui_herobanner.elements.theme.codename,

			// links
			contentTypes.wp_homepage.elements.links.codename,
			contentTypes.ui_link_list.elements.title.codename,
			contentTypes.ui_link_list.elements.items.codename,
			contentTypes.ui_link_list.elements.columns.codename,

			//ui card
			contentTypes.ui_cards.elements.title.codename,
			contentTypes.ui_cards.elements.theme.codename,
			contentTypes.ui_cards.elements.display.codename,

			// ui_cards -> content block
			contentTypes.contentblock.elements.title.codename,
			contentTypes.contentblock.elements.sub_title.codename,
			contentTypes.contentblock.elements.content.codename,
			contentTypes.contentblock.elements.image.codename,
			contentTypes.contentblock.elements.more_info_link.codename,

			// ui_cards -> contentblock - more_info_link -> item
			contentTypes.ui_menu.elements.item.codename,
			contentTypes.weblinkext.elements.link_url.codename,

			// TODO: for transitioning from v1 to v2
			contentTypes.ui_menu.elements.subitems.codename,
			contentTypes.ui_menu.elements.subtitle.codename,
			contentTypes.ui_homepage_tile_callout.elements.tiles.codename,
			contentTypes.ui_homepage_tile_callout.elements.background_color
				.codename,
			contentTypes.ui_homepage_tile_callout.elements.divider_color
				.codename,
			contentTypes.ui_homepage_tile_callout.elements.font_color.codename,
			contentTypes.ui_homepage_tile_callout.elements.arrow_color.codename,
			contentTypes.ui_card_newsletter_subscription.elements.input_label
				.codename,
			contentTypes.ui_card_newsletter_subscription.elements.button_label
				.codename,
			contentTypes.ui_card_newsletter_subscription.elements.createsend_id
				.codename,
			contentTypes.ui_card_newsletter_subscription.elements
				.createsend_action.codename,
		],
		kontentClient: getNonLinkedItemsClient(),
	})
}

async function buildData({ result }: DataBuilderBuildDataParams) {
	return {
		...result,
		rootLayoutClassName: '!pt-0',
	}
}

const _ = {
	buildData,
	getPageResponse,
}

export default _
