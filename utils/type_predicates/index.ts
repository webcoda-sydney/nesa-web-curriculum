import {
	AceGroup,
	AceRule,
	AceRuleitem,
	AceSubgroup,
	ContentOutcomenotification,
	Contentrichtext,
	Focusarea,
	Focusareaoption,
	Optionslist,
	ReleasenoteAceKla,
	ReleasenoteAceSyllabus,
	ReleasenoteGeneral,
	ReleasenoteSyllabus,
	ReleasenoteSyllabusKla,
	ReleasenoteSyllabusMultiple,
	Teachingadvice,
	UiVideoTile,
	WebLinkContentgroup,
	WebLinkFocusarea,
	WebLinkSyllabus,
	WebLinkTeachingadvice,
	Weblinkext,
	Weblinkint,
	Weblinkvideo,
} from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { AssetWithRawElements, AssetWithRawElementsFocusareaTeachingadvice } from '@/types'
import { WebLinkTeachingadviceExtended } from '@/types/customKontentTypes'
import { IContentItem } from '@kontent-ai/delivery-sdk'

export const makePredicateKontent =
	<T>(contentTypeKey: string) =>
		(obj: any): obj is T => {
			if (!!obj && 'system' in obj) {
				let _obj = obj as IContentItem
				return _obj.system.type === contentTypes[contentTypeKey].codename
			}
			return false
		}

export const isWebLinkint = makePredicateKontent<Weblinkint>(
	contentTypes.weblinkint.codename,
)
export const isWebLinkext = makePredicateKontent<Weblinkext>(
	contentTypes.weblinkext.codename,
)
export const isWebLinkSyllabus = makePredicateKontent<WebLinkSyllabus>(
	contentTypes.web_link_syllabus.codename,
)
export const isWebLinkVideo = makePredicateKontent<Weblinkvideo>(
	contentTypes.weblinkvideo.codename,
)

export const isUiVideoTile = makePredicateKontent<UiVideoTile>(
	contentTypes.ui_video_tile.codename,
)

export const isAceGroup = (obj: any): obj is AceGroup => {
	if ('system' in obj) {
		let _obj = obj as IContentItem
		return _obj.system.type === contentTypes.ace_group.codename
	}
	return false
}

export const isAssetWithRawElement = (
	obj: any,
): obj is AssetWithRawElements => {
	return 'resource_type' in obj
}

export const isFocusarea = makePredicateKontent<Focusarea>(
	contentTypes.focusarea.codename,
)

export const isContentrichtext = makePredicateKontent<Contentrichtext>(
	contentTypes.contentrichtext.codename,
)
export const isAceSubGroup = makePredicateKontent<AceSubgroup>(
	contentTypes.ace_subgroup.codename,
)
export const isAceRule = makePredicateKontent<AceRule>(
	contentTypes.ace_rule.codename,
)
export const isAceRuleItem = makePredicateKontent<AceRuleitem>(
	contentTypes.ace_ruleitem.codename,
)
export const isReleasenoteSyllabus = makePredicateKontent<ReleasenoteSyllabus>(
	contentTypes.releasenote_syllabus.codename,
)
export const isReleasenoteSyllabusKla =
	makePredicateKontent<ReleasenoteSyllabusKla>(
		contentTypes.releasenote_syllabus_kla.codename,
	)
export const isReleasenoteSyllabusMultiple =
	makePredicateKontent<ReleasenoteSyllabusMultiple>(
		contentTypes.releasenote_syllabus_multiple.codename,
	)
export const isReleasenoteAce = makePredicateKontent<ReleasenoteAceSyllabus>(
	contentTypes.releasenote_ace_syllabus.codename,
)
export const isReleasenoteAceSyllabus =
	makePredicateKontent<ReleasenoteAceSyllabus>(
		contentTypes.releasenote_ace_syllabus.codename,
	)
export const isReleasenoteAceKla = makePredicateKontent<ReleasenoteAceKla>(
	contentTypes.releasenote_ace_kla.codename,
)
export const isReleasenoteGeneral = makePredicateKontent<ReleasenoteGeneral>(
	contentTypes.releasenote_general.codename,
)

export const isContentOutcomenotification =
	makePredicateKontent<ContentOutcomenotification>(
		contentTypes.content_outcomenotification.codename,
	)
export const isOptionList = makePredicateKontent<Optionslist>(
	contentTypes.optionslist.codename,
)

export const isWebLinkFocusarea = makePredicateKontent<WebLinkFocusarea>(
	contentTypes.web_link_focusarea.codename,
)

export const isWebLinkContentgroup = makePredicateKontent<WebLinkContentgroup>(
	contentTypes.web_link_contentgroup.codename,
)

export const isWebLinkTeachingadvice =
	makePredicateKontent<WebLinkTeachingadvice>(
		contentTypes.web_link_teachingadvice.codename,
	)

export const isTeachingAdvice = makePredicateKontent<Teachingadvice>(
	contentTypes.teachingadvice.codename,
)

export const isFocusareaoption = makePredicateKontent<Focusareaoption>(
	contentTypes.focusareaoption.codename,
)
export const isWebLinkTeachingadviceExtended = (
	obj: any,
): obj is WebLinkTeachingadviceExtended => {
	return 'extendedTeachingAdvice' in obj && 'link' in obj
}

export const isWebLinkVideoOrExtOrTeachingAdviceExtended = (
	obj,
): obj is Weblinkvideo | Weblinkext | WebLinkTeachingadviceExtended =>
	isWebLinkVideo(obj) ||
	isWebLinkext(obj) ||
	isWebLinkTeachingadviceExtended(obj)

export const isAssetWithRawElementsFocusareaTeachingadvice = (obj): obj is AssetWithRawElementsFocusareaTeachingadvice => {
	return 'focusareas' in obj && 'teachingadvices' in obj
}