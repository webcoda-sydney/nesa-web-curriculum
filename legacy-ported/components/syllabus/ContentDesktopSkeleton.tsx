import Skeleton from '@mui/material/Skeleton'

export const FocusAreaSkeleton = () => {
	return (
		<div className="space-y-8 p-8 border rounded-md">
			<div className="space-y-3">
				<div>
					<Skeleton animation="wave" height={30} />
					<Skeleton animation="wave" height={30} width="75%" />
				</div>

				<div>
					<Skeleton animation="wave" height={24} width="50%" />
				</div>

				<div>
					<Skeleton animation="wave" height={16} />
					<Skeleton animation="wave" height={16} />
					<Skeleton animation="wave" height={16} />
					<Skeleton animation="wave" height={16} width="50%" />
				</div>
			</div>
		</div>
	)
}

const OUTCOME_RICHTEXT = new Array(8).fill('')

export const OutcomeDetailCardSkeleton = () => {
	return (
		<div className="border pt-6 pb-8 px-8 relative border-t-8">
			<Skeleton
				animation="wave"
				width="75%"
				height={48}
				className="mb-8"
			></Skeleton>
			<div className="space-y-4 lg:space-y-8">
				{OUTCOME_RICHTEXT.map((_, _index) => (
					<div key={_index}>
						{OUTCOME_RICHTEXT.map((_, index) => (
							<Skeleton
								animation="wave"
								key={index}
								width={
									index < OUTCOME_RICHTEXT.length - 1
										? '100%'
										: '50%'
								}
								height={16}
							></Skeleton>
						))}
					</div>
				))}
			</div>
		</div>
	)
}
