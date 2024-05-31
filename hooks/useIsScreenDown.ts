import useTheme from '@mui/material/styles/useTheme'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Breakpoint } from '@mui/system/createTheme/createBreakpoints'

export const useIsScreenDown = (breakpoint: Breakpoint) => {
	const theme = useTheme()
	return useMediaQuery(theme.breakpoints.down(breakpoint))
}
