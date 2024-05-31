import { Icon as IconifyIcon, IconProps } from '@iconify/react'

// It is possible to use Icon component, but it would increase the bundle size https://material-ui.com/components/icons/#icon-font-icons
function Icon(props: IconProps) {
	const { icon, width = 24, height = 24, ...others } = props
	return <IconifyIcon {...others} icon={icon} width={width} height={height} />
}
export default Icon
