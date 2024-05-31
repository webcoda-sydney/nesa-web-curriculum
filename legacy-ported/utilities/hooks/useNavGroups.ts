import type { ReactNode } from 'react'
// import { makeLearningAreaUrl, Sections } from '../../constants/pathConstants';
// import useWebpages from './useWebpages';
// import { IWebpage } from '../backendTypes';
// import { AllKeyLearningAreas } from '../../store/mock/keyLearningAreas';

export interface NavGroup {
	id: string
	text: string
	description?: string
	icon?: ReactNode
	pageTitle?: string
	pageDesc?: string
	url: string
	disabled?: boolean
	subNav?: NavGroup[]
}

export interface NavGroupSection {
	label: string
	//   links: Action[];
	links: any[]
}

// export const stagesPrimary: NavGroupSection = {
//   label: Sections.STAGES.pages.PRIMARY.title,
//   links: [
//     Sections.STAGES.pages.PRIMARY.sub_pages.EARLY_STAGE_1,
//     Sections.STAGES.pages.PRIMARY.sub_pages.STAGE_1,
//     Sections.STAGES.pages.PRIMARY.sub_pages.STAGE_2,
//     Sections.STAGES.pages.PRIMARY.sub_pages.STAGE_3,
//     {
//       url: Sections.STAGES.pages.PRIMARY.url,
//       title: 'View all',
//       isDisabled: true, // TODO: Remove after MVP
//     },
//   ] as UrlLink[],
// } as const;

// export const stagesSecondary: NavGroupSection = {
//   label: Sections.STAGES.pages.SECONDARY.title,
//   links: [
//     Sections.STAGES.pages.SECONDARY.sub_pages.STAGE_4,
//     Sections.STAGES.pages.SECONDARY.sub_pages.STAGE_5,
//     {
//       url: Sections.STAGES.pages.SECONDARY.url,
//       title: 'View all',
//       isDisabled: true, // TODO: Remove after MVP
//     },
//   ] as UrlLink[],
// } as const;

// export const stagesSenior: NavGroupSection = {
//   label: Sections.STAGES.pages.SENIOR.title,
//   links: [
//     Sections.STAGES.pages.SENIOR.sub_pages.STAGE_6,
//     {
//       url: Sections.STAGES.pages.SENIOR.url,
//       title: 'View all',
//       isDisabled: true, // TODO: Remove after MVP
//     },
//   ] as UrlLink[],
// } as const;

// export const condensedStages: NavGroupSection = {
//   label: Sections.STAGES.title,
//   links: [
//     {
//       url: Sections.STAGES.pages.PRIMARY.url,
//       title: Sections.STAGES.pages.PRIMARY.title,
//       isDisabled: true, // TODO: Remove after MVP,
//       pageTitle: Sections.STAGES.pages.PRIMARY.pageTitle,
//       pageDesc: Sections.STAGES.pages.PRIMARY.pageDesc,
//     },
//     {
//       url: Sections.STAGES.pages.SECONDARY.url,
//       title: Sections.STAGES.pages.SECONDARY.title,
//       isDisabled: true, // TODO: Remove after MVP
//       pageTitle: Sections.STAGES.pages.SECONDARY.pageTitle,
//       pageDesc: Sections.STAGES.pages.SECONDARY.pageDesc,
//     },
//     {
//       url: Sections.STAGES.pages.SENIOR.url,
//       title: Sections.STAGES.pages.SENIOR.title,
//       isDisabled: true, // TODO: Remove after MVP
//       pageTitle: Sections.STAGES.pages.SENIOR.pageTitle,
//       pageDesc: Sections.STAGES.pages.SENIOR.pageDesc,
//     },
//   ] as UrlLink[],
// } as const;

// export const learningAreas: NavGroupSection = {
//   label: Sections.LEARNING_AREAS.title,
//   links: AllKeyLearningAreas.map((kla) => {
//     // get page title and desc based on the current id
//     const KLA_ID = kla.id.toUpperCase().replace('-', '_');
//     const route = Object.entries(Sections.LEARNING_AREAS.pages).find(
//       (item) => item && item.length > 0 && item[0] === KLA_ID,
//     );
//     if (route && route.length > 1) {
//       return ({
//         url: makeLearningAreaUrl(kla.id),
//         title: kla.title,
//         pageTitle: route[1].pageTitle,
//         pageDesc: route[1].pageDesc,
//       });
//     }
//     return ({
//       url: makeLearningAreaUrl(kla.id),
//       title: kla.title,
//     });
//   }),
// };

// export const syllabusSupport: NavGroupSection = {
//   label: Sections.SYLLABUS_SUPPORT.title,
//   links: [
//     Sections.SYLLABUS_SUPPORT.pages.INTRODUCTION,
//     Sections.SYLLABUS_SUPPORT.pages.ADVICE,
//     Sections.SYLLABUS_SUPPORT.pages.RESOURCES,
//     // TODO: Add after MVP
//     // Sections.SYLLABUS_SUPPORT.pages.GRADED_WORK,
//     // Sections.SYLLABUS_SUPPORT.pages.STANDARDS_MATERIALS,
//     // Sections.SYLLABUS_SUPPORT.pages.PAST_HSC,
//   ] as UrlLink[],
// } as const;

// export const globalSupport: NavGroupSection = {
//   label: Sections.GLOBAL_SUPPORT.title,
//   links: [
//     // TODO: Add after MVP
//     // Sections.GLOBAL_SUPPORT.pages.SUGGESTED_TEXTS,
//     Sections.GLOBAL_SUPPORT.pages.GLOSSARY,
//     // Sections.GLOBAL_SUPPORT.pages.PARENT_GUIDE,
//     // TODO: Add after MVP
//     // Sections.GLOBAL_SUPPORT.pages.CREDENTIAL_REQ,
//   ] as UrlLink[],
// } as const;

// const teachingAndLearning = (pages: IWebpage[]): NavGroup => ({
//   id: 'teaching',
//   label: Sections.TEACHING.title,
//   url: Sections.TEACHING.url,
//   sections: [
//     {
//       label: Sections.TEACHING.title,
//       links: pages
//         .filter((p) => p.sectionCode === 'TAL')
//         .map<UrlLink>((p) => {
//           // get page title and desc based on the current id
//           const ID = p.page_url.toUpperCase().replace('-', '_');
//           const route = Object.entries(Sections.TEACHING.pages).find(
//             (item) => item && item.length > 0 && item[0] === ID,
//           );
//           if (route && route.length > 1) {
//             return ({
//               url: `${Sections.TEACHING.url}/${p.page_url}`,
//               title: p.title,
//               pageTitle: route[1].pageTitle,
//               pageDesc: route[1].pageDesc,
//             });
//           }
//           return ({
//             url: `${Sections.TEACHING.url}/${p.page_url}`,
//             title: p.title,
//           });
//         }),
//     },
//   ],
// });

// export const teachingAndLearningExtraPages: NavGroupSection = {
//   label: Sections.TEACHING.title,
//   links: [
//     Sections.TEACHING.pages.PLACE,
//     Sections.TEACHING.pages.DIVERSITY,
//     Sections.TEACHING.pages.LEARNING_ACROSS_CUR,
//     Sections.TEACHING.pages.PARENT_GUIDES,
//     Sections.TEACHING.pages.ABORIGINAL,
//   ] as UrlLink[],
// } as const;

// export const englishPages: NavGroupSection = {
//   label: Sections.LEARNING_AREAS.pages.ENGLISH.title,
//   links: [
//     Sections.LEARNING_AREAS.pages.ENGLISH.sub_pages.ENGLISH_K_10,
//   ] as UrlLink[],
// } as const;

// export const mathPages: NavGroupSection = {
//   label: Sections.LEARNING_AREAS.pages.MATHEMATICS.title,
//   links: [
//     Sections.LEARNING_AREAS.pages.MATHEMATICS.sub_pages.MATHEMATICS_K_10,
//   ] as UrlLink[],
// } as const;

// export const frontendPages = () => {
//   const [webpages, pagesLoading] = useWebpages();

//   return [
//     {
//       id: 'home',
//       label: Sections.HOME.title,
//       url: Sections.HOME.url,
//       pageTitle: Sections.HOME.pageTitle,
//       pageDesc: Sections.HOME.pageDesc,
//     },
//     {
//       id: 'learningAreas',
//       label: Sections.LEARNING_AREAS.title,
//       url: Sections.LEARNING_AREAS.url,
//       sections: [learningAreas, englishPages, mathPages],
//     },
//     {
//       id: 'stages',
//       label: Sections.STAGES.title,
//       url: Sections.STAGES.url,
//       sections: [condensedStages, stagesPrimary, stagesSecondary, stagesSenior],
//     },
//     teachingAndLearning(webpages),
//     {
//       id: 'teaching-extra',
//       label: Sections.TEACHING.title,
//       url: Sections.TEACHING.url,
//       sections: [teachingAndLearningExtraPages],
//     },
//     {
//       id: 'resources',
//       label: Sections.RESOURCES.title,
//       url: Sections.RESOURCES.url,
//       sections: [syllabusSupport, globalSupport],
//     },
//     {
//       id: 'custom',
//       label: Sections.CUSTOM_VIEW.title,
//       url: Sections.CUSTOM_VIEW.url,
//       icon: Sections.CUSTOM_VIEW.icon,
//       pageTitle: Sections.CUSTOM_VIEW.pageTitle,
//       pageDesc: Sections.CUSTOM_VIEW.pageDesc,
//     },
//     {
//       id: 'custom-syllabus',
//       label: Sections.CUSTOM_SYLLABUS.title,
//       url: Sections.CUSTOM_SYLLABUS.url,
//       pageTitle: Sections.CUSTOM_SYLLABUS.pageTitle,
//       pageDesc: Sections.CUSTOM_SYLLABUS.pageDesc,
//     },
//   ];
// };

// export default (condensed = false) => {
//   const [webpages, pagesLoading] = useWebpages();

//   return [
//     {
//       id: 'home',
//       label: Sections.HOME.title,
//       url: Sections.HOME.url,
//       pageTitle: Sections.HOME.pageTitle,
//       pageDesc: Sections.HOME.pageDesc,
//     },
//     {
//       id: 'learningAreas',
//       label: Sections.LEARNING_AREAS.title,
//       url: Sections.LEARNING_AREAS.url,
//       sections: [learningAreas],
//     },
//     {
//       id: 'stages',
//       label: Sections.STAGES.title,
//       url: Sections.STAGES.url,
//       sections: condensed ? [condensedStages] : [stagesPrimary, stagesSecondary, stagesSenior],
//     },
//     teachingAndLearning(webpages),
//     {
//       id: 'resources',
//       label: Sections.RESOURCES.title,
//       url: Sections.RESOURCES.url,
//       sections: [syllabusSupport, globalSupport],
//     },
//     {
//       id: 'custom',
//       label: Sections.CUSTOM_VIEW.title,
//       url: Sections.CUSTOM_VIEW.url,
//       icon: Sections.CUSTOM_VIEW.icon,
//     },
//   ];
// };
/**
 * Decides how many rows the list should use, based on what will give the 'fullest' appearance.
 * @param length
 */
export const useRowCount = (length: number) => {
	// Find the number of empty spaces left in the last group,
	// if the length is divided into groups of X items.
	const four = 3 - ((length - 1) % 4) // [1,2,3,4,5,6] -> [3,2,1,0,3,2]
	const five = 4 - ((length - 1) % 5) // [1,2,3,4,5,6] -> [4,3,2,1,0,4]

	return four < five ? 4 : 5
}
