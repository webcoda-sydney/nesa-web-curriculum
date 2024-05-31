import MPagination, { PaginationProps } from '@mui/material/Pagination'
import clsx from 'clsx'

const style = {
	'.MuiPaginationItem-root': {
		borderRadius: 'var(--nsw-border-radius)',
		fontSize: '1rem',
		fontWeight: 700,
		color: 'var(--nsw-brand-dark)',

		'&.Mui-selected': {
			color: 'var(--nsw-text-dark)',
			backgroundColor: 'transparent',
			':after': {
				content: '""',
				position: 'absolute',
				bottom: '0',
				left: '0.25rem',
				right: '0.25rem',
				height: '2px',
				backgroundColor: 'var(--nsw-brand-accent)',
			},
		},
		'&&:hover:not(.Mui-selected)': {
			backgroundColor: 'var(--nsw-text-hover)',
		},
		'&&:focus': {
			backgroundColor: 'transparent',
			outlineWidth: 3,
			outline: 'solid 3px var(--nsw-focus)',
			outlineOffset: 0,
		},
	},
} as const

const Pagination = (props: PaginationProps) => {
	const getItemAriaLabel: PaginationProps['getItemAriaLabel'] = (
		_type,
		page,
	) => {
		if (_type === 'page') {
			return page + ''
		}
		return _type
	}

	return (
		<div css={style} className="flex justify-center">
			<MPagination
				shape="rounded"
				getItemAriaLabel={getItemAriaLabel}
				{...props}
				className={clsx('nsw-pagination')}
			/>
		</div>
	)
}

export default Pagination
