import ListingLanding from '@/components/layouts/ListingLanding'
import type { WpLearningareas as WpLearningareasModel } from '@/kontent/content-types/wp_learningareas'
import type { CommonPageProps } from '@/types'

function WpLearningAreas(props: CommonPageProps<WpLearningareasModel>) {
	return <ListingLanding {...props} />
}

export default WpLearningAreas
