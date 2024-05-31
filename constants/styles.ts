import { TREE_ID_LABELS } from './treepickeroptions'

export const STYLES = {
	IS_PREVIEW_SCROLL_MARGIN_TOP: {
		'.is-preview &': {
			scrollMarginTop: '26px',
		},
	},

	LIFE_SKILL_TREE_PICKER: {
		'.tree-picker-id-life_skills': {
			borderTop: '1px solid var(--nsw-grey-01)',
			marginTop: 8,
			paddingTop: 8,
		},
	},

	TAGS_TREE_PICKER: {
		[`.tree-picker-id-${TREE_ID_LABELS.TAGS.id}`]: {
			borderTop: '1px solid var(--nsw-grey-01)',
			marginTop: 8,
			paddingTop: 8,
		},
	},

	DARK_BACKGROUND_RTE: {
		'&&': {
			a: {
				color: 'inherit',
				'&:hover': {
					backgroundColor: 'var(--nsw-text-hover-light)',
					outlineColor: 'var(--nsw-text-hover-light)',
				},
			},
		},
	},
}
