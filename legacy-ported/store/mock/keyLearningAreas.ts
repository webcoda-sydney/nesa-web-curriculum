import type { ILearningArea } from '../../utilities/backendTypes'
import { uriConvert } from '../../utilities/functions'

export const KlaTitles = {
	english: 'English',
	mathematics: 'Mathematics',
	science: 'Science',
	technology: 'Technologies',
	hsie: 'HSIE',
	creativeArts: 'Creative Arts',
	pdhpe: 'PDHPE',
	languages: 'Languages',
	vet: 'VET',
} as const

export const KlaIds = {
	english: uriConvert(KlaTitles.english),
	mathematics: uriConvert(KlaTitles.mathematics),
	science: uriConvert(KlaTitles.science),
	technology: uriConvert(KlaTitles.technology),
	hsie: uriConvert(KlaTitles.hsie),
	creativeArts: uriConvert(KlaTitles.creativeArts),
	pdhpe: uriConvert(KlaTitles.pdhpe),
	languages: uriConvert(KlaTitles.languages),
	vet: uriConvert(KlaTitles.vet),
} as const

export const AllKeyLearningAreas: ILearningArea[] = [
	{
		id: KlaIds.english,
		title: KlaTitles.english,
		description: '',
		available: true,
	},
	{
		id: KlaIds.mathematics,
		title: KlaTitles.mathematics,
		description: '',
		available: true,
	},
	{
		id: KlaIds.science,
		title: KlaTitles.science,
		description: '',
		available: false,
	},
	{
		id: KlaIds.technology,
		title: KlaTitles.technology,
		description: '',
		available: false,
	},
	{
		id: KlaIds.hsie,
		title: KlaTitles.hsie,
		description: '',
		available: false,
	},
	{
		id: KlaIds.creativeArts,
		title: KlaTitles.creativeArts,
		description: '',
		available: false,
	},
	{
		id: KlaIds.pdhpe,
		title: KlaTitles.pdhpe,
		description: '',
		available: false,
	},
	{
		id: KlaIds.languages,
		title: KlaTitles.languages,
		description: '',
		available: false,
	},
	{
		id: KlaIds.vet,
		title: 'VET',
		description: '',
		available: false,
	},
]

export const findKeyLearningArea = (id: ILearningArea['id']) =>
	AllKeyLearningAreas.find((s) => s.id === id) ?? {
		id,
		title: 'Unknown',
		description: '',
		syllabusIds: [],
		available: false,
	}
