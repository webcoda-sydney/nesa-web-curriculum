import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import { KlaIds } from '../store/mock/keyLearningAreas'
import { Stages } from '../store/mock/stages'
import { uriConvert } from '../utilities/functions'

const ROOT = '/'
const HOME = '/home'
const LEARNING_AREAS = '/learning-areas'
const TEACHING_AND_LEARNING = '/teaching-and-learning'
const SYLLABUS_SUPPORT = '/syllabus-support'
const GLOBAL_SUPPORT = '/curriculum-support'
const STAGES = '/stages'
const PRIMARY = '/primary'
const SECONDARY = '/secondary'
const SENIOR = '/senior'
const ENGLISH = `/${KlaIds.english}`
const MATHEMATICS = `/${KlaIds.mathematics}`
const HSIE = `/${KlaIds.hsie}`
const CREATIVE_ARTS = `/${KlaIds.creativeArts}`
const PDHPE = `/${KlaIds.pdhpe}`
const LANGUAGES = `/${KlaIds.languages}`
const SCIENCE = `/${KlaIds.science}`
const TECHNOLOGIES = `/${KlaIds.technology}`
const VET = `/${KlaIds.vet}`

const _ = {
	ROOT,
	HOME,
	LEARNING_AREAS,
	STAGES,
}

export default _

export const makeLearningAreaUrl = (klaId: string) =>
	`${LEARNING_AREAS}/${uriConvert(klaId)}`
export const makeSyllabusUrl = (klaId: string, syllabusId: string) =>
	`${LEARNING_AREAS}/${uriConvert(klaId)}/${syllabusId}`

export const Sections = {
	HOME: {
		url: HOME,
		title: 'Home',
		pageTitle: 'NSW Curriculum',
		pageDesc:
			'Curriculum resources for schools in NSW, including syllabuses, teaching advice and support materials.',
	},
	STAGES: {
		url: STAGES,
		title: 'Stages',
		pages: {
			PRIMARY: {
				url: `${STAGES}${PRIMARY}`,
				title: 'Primary (K–6)',
				pageTitle: 'Primary (K–6) syllabuses | Primary',
				pageDesc:
					'Information on Early Stage 1 to Stage 3 Primary (K–6) syllabuses for all learning areas in NSW.',
				sub_pages: {
					EARLY_STAGE_1: {
						url: `${STAGES}${PRIMARY}/${Stages.earlyStage1.id}`,
						title: 'Early Stage 1',
						pageTitle: 'Early Stage 1 (Kindergarten) | Primary',
						pageDesc:
							'Course content, outcomes, resources and teaching and learning support for all syllabuses taught in Early Stage 1 (Kindergarten) in NSW.',
					},
					STAGE_1: {
						url: `${STAGES}${PRIMARY}/${Stages.stage1.id}`,
						title: 'Stage 1',
						pageTitle: 'Stage 1 (Years 1–2) | Primary',
						pageDesc:
							'Course content, outcomes, resources and teaching and learning support for all syllabuses taught in Stage 1 (Years 1–2) in NSW.',
					},
					STAGE_2: {
						url: `${STAGES}${PRIMARY}/${Stages.stage2.id}`,
						title: 'Stage 2',
						pageTitle: '',
						pageDesc: '',
						isDisabled: true, // TODO: Remove after MVP
					},
					STAGE_3: {
						url: `${STAGES}${PRIMARY}/${Stages.stage3.id}`,
						title: 'Stage 3',
						pageTitle: '',
						pageDesc: '',
						isDisabled: true, // TODO: Remove after MVP
					},
				},
			},
			SECONDARY: {
				url: `${STAGES}${SECONDARY}`,
				title: 'Secondary (7–10)',
				pageTitle: 'Secondary (7–10) syllabuses | Secondary',
				pageDesc:
					'Information on Stage 4 to Stage 5 Secondary (7–10) syllabuses for all learning areas in NSW.',
				sub_pages: {
					STAGE_4: {
						url: `${STAGES}${SECONDARY}/${Stages.stage4.id}`,
						title: 'Stage 4',
						pageTitle: '',
						pageDesc: '',
						isDisabled: true, // TODO: Remove after MVP
					},
					STAGE_5: {
						url: `${STAGES}${SECONDARY}/${Stages.stage5.id}`,
						title: 'Stage 5',
						pageTitle: '',
						pageDesc: '',
						isDisabled: true, // TODO: Remove after MVP
					},
				},
			},
			SENIOR: {
				url: `${STAGES}${SENIOR}`,
				title: 'Senior (11–12)',
				pageTitle: 'Senior (11–12) syllabuses | Senior',
				pageDesc:
					'Information on Stage 6 Senior (11–12) syllabuses for all learning areas in NSW.',
				sub_pages: {
					STAGE_6: {
						url: `${STAGES}${SENIOR}/${Stages.stage6.id}`,
						title: 'Stage 6',
						pageTitle: '',
						pageDesc: '',
						isDisabled: true, // TODO: Remove after MVP
					},
				},
			},
		},
	},
	LEARNING_AREAS: {
		url: LEARNING_AREAS,
		title: 'Learning areas',
		pages: {
			ENGLISH: {
				url: `${LEARNING_AREAS}${ENGLISH}`,
				title: 'English',
				pageTitle: 'English syllabuses',
				pageDesc: 'The NSW Kindergarten to Year 12 English syllabuses.',
				sub_pages: {
					ENGLISH_K_10: {
						url: `${LEARNING_AREAS}${ENGLISH}/english-k-10`,
						title: 'English K–10',
						pageTitle: 'English K–10',
						pageDesc:
							'The syllabus, resources and teaching and learning support materials for English K–10 in NSW.',
					},
				},
			},
			MATHEMATICS: {
				url: `${LEARNING_AREAS}${MATHEMATICS}`,
				title: 'Mathematics',
				pageTitle: 'Mathematics syllabuses',
				pageDesc:
					'The NSW Kindergarten to Year 12 Mathematics syllabuses.',
				sub_pages: {
					MATHEMATICS_K_10: {
						url: `${LEARNING_AREAS}${MATHEMATICS}/mathematics-k-10`,
						title: 'Mathematics K–10',
						pageTitle: 'Mathematics K–10',
						pageDesc:
							'The syllabus, resources and teaching and learning support materials for Mathematics K–10 in NSW.',
					},
				},
			},
			HSIE: {
				url: `${LEARNING_AREAS}${HSIE}`,
				title: 'HSIE',
				pageTitle: 'HSIE syllabuses',
				pageDesc:
					'The NSW Kindergarten to Year 12 Human Society and its Environment (HSIE) syllabuses.',
				sub_pages: {},
			},
			CREATIVE_ARTS: {
				url: `${LEARNING_AREAS}${CREATIVE_ARTS}`,
				title: 'Creative Arts',
				pageTitle: 'Creative Arts syllabuses',
				pageDesc:
					'The NSW Kindergarten to Year 12 Creative Arts syllabuses.',
				sub_pages: {},
			},
			PDHPE: {
				url: `${LEARNING_AREAS}${PDHPE}`,
				title: 'PDHPE',
				pageTitle: 'PDHPE syllabuses',
				pageDesc:
					'The NSW Kindergarten to Year 12 Personal Development, Health and Physical Education (PDHPE) syllabuses.',
				sub_pages: {},
			},
			LANGUAGES: {
				url: `${LEARNING_AREAS}${LANGUAGES}`,
				title: 'Languages',
				pageTitle: 'Languages syllabuses',
				pageDesc:
					'The NSW Kindergarten to Year 12 Languages syllabuses.',
				sub_pages: {},
			},
			SCIENCE: {
				url: `${LEARNING_AREAS}${SCIENCE}`,
				title: 'Science',
				pageTitle: 'Science syllabuses',
				pageDesc: 'The NSW Kindergarten to Year 12 Science syllabuses.',
				sub_pages: {},
			},
			TECHNOLOGIES: {
				url: `${LEARNING_AREAS}${TECHNOLOGIES}`,
				title: 'Technologies',
				pageTitle: 'Technologies syllabuses',
				pageDesc:
					'The NSW Kindergarten to Year 12 Technologies syllabuses.',
				sub_pages: {},
			},
			VET: {
				url: `${LEARNING_AREAS}${VET}`,
				title: 'VET',
				pageTitle: 'VET syllabuses',
				pageDesc: '',
				sub_pages: {},
			},
		},
	},
	TEACHING: {
		url: TEACHING_AND_LEARNING,
		title: 'Teaching and learning',
		pages: {
			INTRODUCTION: {
				url: `${TEACHING_AND_LEARNING}/introduction`,
				title: 'Introduction',
				pageTitle: 'Introduction | Teaching and learning',
				pageDesc: 'An introduction to the K–12 curriculum in NSW.',
			},
			NSW_CURRICULUM: {
				url: `${TEACHING_AND_LEARNING}/nsw-curriculum`,
				title: 'NSW curriculum',
				pageTitle: 'NSW Curriculum | Teaching and learning',
				pageDesc:
					"NESA's Statement of Equity Principles, Statement of Values, and an overview of the syllabus development process.",
			},
			PLACE: {
				url: `${TEACHING_AND_LEARNING}/course-types`,
				title: 'Place in the curriculum and course types',
				pageTitle:
					'Place in the curriculum and course types | Teaching and learning',
				pageDesc:
					'Information to demonstrate the place of syllabuses in the K–12 curriculum and the different course types available.',
			},
			DIVERSITY: {
				url: `${TEACHING_AND_LEARNING}/diversity-of-learners`,
				title: 'Diversity of learners',
				pageTitle: 'Diversity of learners | Teaching and learning',
				pageDesc:
					'Understanding how NESA accommodates the learning requirements of students with diverse learning backgrounds, including Aboriginal students, gifted and talented students, students with English as an additional language or dialect and students with disability.',
			},
			ABORIGINAL: {
				url: `${TEACHING_AND_LEARNING}/aboriginal-education`,
				title: 'Aboriginal Education',
				pageTitle: 'Aboriginal Education | Teaching and learning',
				pageDesc:
					'Information for schools and communities to help ensure successful and sustainable educational outcomes for Aboriginal students.',
			},
			SAFETY: {
				url: `${TEACHING_AND_LEARNING}/safety`,
				title: 'Safety',
				pageTitle: '',
				pageDesc: '',
			},
			PROGRAMMING: {
				url: `${TEACHING_AND_LEARNING}/programming`,
				title: 'Programming',
				pageTitle: 'Programming | Teaching and learning',
				pageDesc:
					'Information on programming for teachers to help plan the delivery of syllabus content and improve learning outcomes for students.',
			},
			ASSESSMENT: {
				url: `${TEACHING_AND_LEARNING}/assessment`,
				title: 'Assessment',
				pageTitle: 'Assessment | Teaching and learning',
				pageDesc:
					"Information and advice on how assessments are used in NSW schools as part of students' learning.",
			},
			PARENT_GUIDES: {
				url: `${TEACHING_AND_LEARNING}/parent-guides`,
				title: 'Parent Guide to the NSW Primary Syllabuses',
				pageTitle: 'Parent Guide to the NSW Primary Syllabuses',
				pageDesc: 'Parent Guide to the NSW Primary Syllabuses',
			},
			REPORTING: {
				url: `${TEACHING_AND_LEARNING}/reporting`,
				title: 'Reporting',
				pageTitle: '',
				pageDesc: '',
			},
			LEARNING_ACROSS_CUR: {
				url: `${TEACHING_AND_LEARNING}/learning-across-curriculum`,
				title: 'Learning across the curriculum',
				pageTitle:
					'Learning across the curriculum | Teaching and learning',
				pageDesc:
					'Understanding how NESA uses learning across the curriculum content to help students achieve broad learning outcomes.',
			},
		},
	},
	RESOURCES: {
		url: '/resources',
		title: 'Resources',
		pageTitle: '',
		pageDesc: '',
	},
	CUSTOM_VIEW: {
		url: '/custom-view',
		title: 'Custom download/view',
		pageTitle: 'Print/download curriculum | Custom',
		pageDesc:
			'Resources for teachers, students and parents to download a customisable syllabus dependent on KLA, Stage and additional options. ',
		icon: <CloudDownloadIcon />,
	},
	CUSTOM_SYLLABUS: {
		url: '/custom-syllabus',
		title: 'Custom Syllabus',
		pageTitle: 'Custom Syllabus',
		pageDesc: '',
	},
	CUSTOM_SYLLABUS_TAGS: {
		url: '/custom-syllabus-tags',
		title: 'Custom Syllabus',
	},
	SYLLABUS_SUPPORT: {
		url: SYLLABUS_SUPPORT,
		title: 'Syllabus support',
		pages: {
			INTRODUCTION: {
				url: `${SYLLABUS_SUPPORT}/introduction`,
				title: 'Introduction',
				pageTitle: 'Introduction to the syllabus | Syllabus support',
				pageDesc:
					'An introduction to the NSW syllabuses, including information and resources for teachers, parents and students. ',
			},
			ADVICE: {
				url: `${SYLLABUS_SUPPORT}/teaching-advice`,
				title: 'Teaching advice',
				pageTitle: 'Teaching advice | Syllabus support',
				pageDesc:
					'Information and advice to assist teachers with the implementation of the NSW K–12 syllabuses.',
			},
			RESOURCES: {
				url: `${SYLLABUS_SUPPORT}/teaching-resources`,
				title: 'Teaching resources',
				pageTitle: 'Teaching resources | Syllabus support',
				pageDesc:
					'Information and resources to assist teachers with the implementation of the NSW K–12 syllabuses.',
			},
			GRADED_WORK: {
				url: `${SYLLABUS_SUPPORT}/graded-work`,
				title: 'Graded and annotated work',
				pageTitle: '',
				pageDesc: '',
			},
			STANDARDS_MATERIALS: {
				url: `${SYLLABUS_SUPPORT}/standards_materials`,
				title: 'Standards materials',
				pageTitle: '',
				pageDesc: '',
			},
			PAST_HSC: {
				url: `${SYLLABUS_SUPPORT}/past-hsc-papers`,
				title: 'Past HSC examination papers',
				pageTitle: '',
				pageDesc: '',
			},
		},
	},
	GLOBAL_SUPPORT: {
		url: GLOBAL_SUPPORT,
		title: 'Global support',
		pages: {
			SUGGESTED_TEXTS: {
				url: `${GLOBAL_SUPPORT}/suggested-texts`,
				title: 'Prescribed/suggested text list',
				pageTitle: '',
				pageDesc: '',
			},
			GLOSSARY: {
				url: `${GLOBAL_SUPPORT}/glossary`,
				title: 'Glossary',
				pageTitle: 'Glossary | Curriculum support',
				pageDesc:
					"The general glossary for NESA's syllabuses, performance descriptions and examinations.",
			},
			PARENT_GUIDE: {
				url: `${GLOBAL_SUPPORT}/parent-guides`,
				title: 'Parent guides',
				pageTitle: 'Parent guides | Curriculum support',
				pageDesc:
					"A guide to help parents understand their child's progress through school and NESA's roles and responsibilities.",
			},
			CREDENTIAL_REQ: {
				url: `${GLOBAL_SUPPORT}/credential-requirements`,
				title: 'Credential requirements (ACE)',
				pageTitle: '',
				pageDesc: '',
			},
		},
	},
	PRIVACY_POLICY: {
		url: '/privacy',
		title: 'Privacy',
	},
	TERMS: {
		url: '/terms-conditions',
		title: 'Terms',
	},
	FOOTER: {
		url: '/na',
		title: '/na',
		pages: {
			SITEMAP: {
				url: '/sitemap',
				title: 'Sitemap',
			},
			OPEN_ACCESS_INFO: {
				url: '/open-access-information',
				title: 'Open Access Information',
			},
			ACCESSIBILITY: {
				url: '/accessibility',
				title: 'Accessibility',
			},
			DISCLAIMER: {
				url: '/disclaimer',
				title: 'Disclaimer',
			},
			CONTACT: {
				url: '/contact',
				title: 'Contact',
			},
			NSW_GOVERNMENT: {
				url: 'https://www.nsw.gov.au/',
				title: 'NSW Government',
			},
		},
	},
} as const
