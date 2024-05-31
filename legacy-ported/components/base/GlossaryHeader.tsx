import NonFullWidthWrapper from '@/components/NonFullWidthWrapper'
import Button from '@mui/material/Button'
import { ReactNode, useEffect } from 'react'
import { AlphabetChar, alphabet } from '../../utilities/frontendTypes'
import SearchBar from './SearchBar'

export interface GlossaryHeaderProps {
	/**
	 * Which letter buttons should be disabled.
	 */
	disabled?: AlphabetChar[]

	/**
	 * The currently active letter button
	 */
	selected?: AlphabetChar

	/**
	 * Called when a letter button is pressed
	 * @param char The letter pressed
	 */
	onSelect?: (_char: AlphabetChar) => void

	/**
	 * The initial search term, mostly used for testing
	 */
	startSearchTerm?: string

	/**
	 * Called when the search input is submitted
	 * @param searchText the text being searched for
	 */
	onSearch?: (_searchText: string | null) => void

	/**
	 * Whether to hide explanation text or not
	 */
	hideExplanationText?: boolean

	children?: ReactNode
}

/**
 * Header component for the glossary, includes a search bar and buttons to filter by letter
 * @param props
 * @constructor
 */
const GlossaryHeader = (props: GlossaryHeaderProps): JSX.Element => {
	const { disabled, selected, onSelect, onSearch, children } = props

	const handleButtonClick = (char: AlphabetChar) => () => {
		if (onSelect) {
			onSelect(char)
		}
	}

	useEffect(() => {
		return () => {
			onSelect('' as AlphabetChar)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div className="glossary-header">
			<div className="space-y-0 mt-8">
				<NonFullWidthWrapper>
					<SearchBar
						variant="with-inline-button"
						onSearch={onSearch}
						searchBarPlaceholder="Search"
					></SearchBar>
				</NonFullWidthWrapper>

				{children}
			</div>
			<div className="glossary-header__alphabet-row mt-8">
				{alphabet.map((char) => (
					<Button
						key={char}
						sx={{
							borderWidth: 2,
							'&:hover, &:focus': {
								borderWidth: 2,
								borderColor: 'var(--nsw-brand-dark)',
							},
							'&:disabled': {
								backgroundColor: '#fff',
								opacity: 0.38,
							},
						}}
						className="glossary-header__alphabet-button"
						variant={selected === char ? 'contained' : 'outlined'}
						color="primary"
						disabled={disabled?.includes(char)}
						onClick={handleButtonClick(char)}
					>
						{char}
					</Button>
				))}
			</div>
		</div>
	)
}

export default GlossaryHeader
