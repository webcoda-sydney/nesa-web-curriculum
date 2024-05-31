const nswDesignSystemPalletes = require('nsw-design-system-source/src/core/colour/json/palettes.json')

module.exports = {
	content: [
		'./components/**/*.{js,jsx,ts,tsx}',
		'./pages/**/*.{js,jsx,ts,tsx}',
		'./containers/**/*.{js,jsx,ts,tsx}',
		'./layouts/**/*.{js,jsx,ts,tsx}',
		'./legacy-ported/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		screens: {
			sm: '576px',
			md: '768px',
			lg: '992px',
			xl: '1200px',
		},
		extend: {
			borderColor: {
				DEFAULT: 'var(--nsw-grey-03)',
			},
			colors: {
				nsw: {
					...Object.entries(nswDesignSystemPalletes.palettes).reduce(
						(acc, [key, val]) => {
							return {
								...acc,
								[key]: val,
							}
						},
						{},
					),
					'text-hover': 'var(--nsw-text-hover)',
					'off-white': 'var(--nsw-off-white)',
					'brand-dark': nswDesignSystemPalletes.palettes['blue-01'],
					'brand-light': nswDesignSystemPalletes.palettes['blue-04'],
				},
			},
			fontSize: {
				subtext: ['.75rem', '1.24'],
			},
		},
	},
	plugins: [],
}
