import MuiCheckbox, { CheckboxProps } from '@mui/material/Checkbox'
import Radio, { RadioProps } from '@mui/material/Radio'
import clsx from 'clsx'

export const CheckboxIcon = () => (
	<svg
		width="32"
		height="32"
		viewBox="0 0 32 32"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<rect
			x="0.5"
			y="0.5"
			width="31"
			height="31"
			rx="3.5"
			fill="white"
			stroke="#22272B"
		/>
	</svg>
)
export const CheckboxIconChecked = () => {
	return (
		<svg
			width="32"
			height="32"
			viewBox="0 0 33 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="0.835938"
				y="0.5"
				width="31"
				height="31"
				rx="3.5"
				fill="white"
				stroke="#22272B"
			/>
			<rect
				x="5.33594"
				y="5"
				width="22"
				height="22"
				rx="1"
				fill="#002664"
			/>
			<path
				d="M13.838 19.475L10.363 16L9.17969 17.175L13.838 21.8333L23.838 11.8333L22.663 10.6583L13.838 19.475Z"
				fill="white"
			/>
		</svg>
	)
}

export const CheckboxIconIndeterminate = () => (
	<svg
		width="32"
		height="32"
		viewBox="0 0 32 32"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<rect
			x="0.5"
			y="0.5"
			width="31"
			height="31"
			rx="3.5"
			fill="white"
			stroke="#22272B"
		/>
		<rect x="5" y="5" width="22" height="22" rx="1" fill="#002664" />
		<path d="M21.6667 17H10V15.3333H21.6667V17Z" fill="white" />
	</svg>
)

export const RadioIconChecked = () => (
	<svg
		width="32"
		height="32"
		viewBox="0 0 32 32"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M31.5 16C31.5 24.5604 24.5604 31.5 16 31.5C7.43959 31.5 0.5 24.5604 0.5 16C0.5 7.43959 7.43959 0.5 16 0.5C24.5604 0.5 31.5 7.43959 31.5 16Z"
			fill="white"
			stroke="#22272B"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M16 27C22.0751 27 27 22.0751 27 16C27 9.92487 22.0751 5 16 5C9.92487 5 5 9.92487 5 16C5 22.0751 9.92487 27 16 27Z"
			fill="#002664"
		/>
	</svg>
)
export const RadioIcon = () => (
	<svg
		width="32"
		height="32"
		viewBox="0 0 32 32"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M31.5 16C31.5 24.5604 24.5604 31.5 16 31.5C7.43959 31.5 0.5 24.5604 0.5 16C0.5 7.43959 7.43959 0.5 16 0.5C24.5604 0.5 31.5 7.43959 31.5 16Z"
			fill="white"
			stroke="#22272B"
		/>
	</svg>
)

export const Checkbox = ({ className, ...props }: CheckboxProps) => {
	return (
		<MuiCheckbox
			className={clsx(className)}
			icon={CheckboxIcon()}
			checkedIcon={CheckboxIconChecked()}
			indeterminateIcon={CheckboxIconIndeterminate()}
			css={{
				'&>input:disabled+svg>rect': {
					stroke: 'var(--nsw-grey-03)',
					fill: 'var(--nsw-off-white)',

					':nth-child(2)': {
						fill: 'var(--nsw-grey-03)',
					},
				},
			}}
			{...props}
		/>
	)
}

export const RadioBox = (props: RadioProps) => {
	return (
		<Radio icon={RadioIcon()} checkedIcon={RadioIconChecked()} {...props} />
	)
}

export default Checkbox
