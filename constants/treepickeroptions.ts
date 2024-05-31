import type { TreeElement } from '@/legacy-ported/components/custom/treeUtils'

export const TREE_ID_LABELS: Record<string, TreeElement> = {
	COURSE_OVERVIEW: {
		id: 'course-overview',
		label: 'Course overview',
	},
	RATIONALE: {
		id: 'rationale',
		label: 'Rationale',
	},
	AIM: {
		id: 'aim',
		label: 'Aim',
	},
	OUTCOMES: {
		id: 'outcomes',
		label: 'Outcomes',
	},
	ASSESSMENT: {
		id: 'assessment',
		label: 'Assessment',
	},
	GLOSSARY: {
		id: 'glossary',
		label: 'Glossary',
	},
	TEACHING_AND_LEARNING: {
		id: 'teaching-and-learning',
		label: 'Teaching and learning',
	},

	CONTENT: {
		id: 'content',
		label: 'Content',
	},
	GENERAL_CONTENT: {
		id: 'content',
		label: 'Content of syllabus',
	},
	ALL_CONTENT: {
		id: 'all-content',
		label: 'Content',
	},
	ACCESS_POINTS: {
		id: 'access-points',
		label: 'Access content points',
	},
	TEACHING_ADVICE: {
		id: 'teaching-advice',
		label: 'Teaching advice',
	},
	EXAMPLES: {
		id: 'examples',
		label: 'Examples',
	},
	TAGS: {
		id: 'tags',
		label: 'Tags',
	},
	CURRICULUM_CONNECTIONS: {
		id: 'curriculum-connections',
		label: 'Curriculum Connections',
	},
} as const

export const TREE_OPTIONS_DOWNLOAD: TreeElement[] = [
	TREE_ID_LABELS.COURSE_OVERVIEW,
	TREE_ID_LABELS.RATIONALE,
	TREE_ID_LABELS.AIM,
	TREE_ID_LABELS.OUTCOMES,
	{
		...TREE_ID_LABELS.ALL_CONTENT,
		children: [
			TREE_ID_LABELS.GENERAL_CONTENT,
			TREE_ID_LABELS.ACCESS_POINTS,
			TREE_ID_LABELS.EXAMPLES,
		],
	},
	TREE_ID_LABELS.TAGS,
	TREE_ID_LABELS.TEACHING_ADVICE,
	TREE_ID_LABELS.ASSESSMENT,
	TREE_ID_LABELS.GLOSSARY,
]

export const TREE_OPTIONS_VIEW: TreeElement[] = [
	TREE_ID_LABELS.COURSE_OVERVIEW,
	TREE_ID_LABELS.RATIONALE,
	TREE_ID_LABELS.AIM,
	TREE_ID_LABELS.OUTCOMES,
	TREE_ID_LABELS.CONTENT,
	TREE_ID_LABELS.ASSESSMENT,
	TREE_ID_LABELS.GLOSSARY,
	TREE_ID_LABELS.TEACHING_AND_LEARNING,
]
