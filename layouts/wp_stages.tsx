import ListingLanding from '@/components/layouts/ListingLanding'
import type { WpStages as WpStagesModel } from '@/kontent/content-types/wp_stages'
import type { CommonPageProps } from '@/types'

function WpStages(props: CommonPageProps<WpStagesModel>) {
	return <ListingLanding {...props} />
}

export default WpStages
