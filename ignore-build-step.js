const { exit } = require('process')

const branchName = process.env.VERCEL_GIT_COMMIT_REF || ''
const branchType = branchName.split('/')[0]
const ok = ['main', 'release'].includes(branchType) ? 1 : 0
console.log(
	`Branch: ${branchName} - ${ok ? '✅' : '🛑'} - Build is ${
		ok ? 'proceeding' : 'cancelled'
	}`,
)
exit(ok)
