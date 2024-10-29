import { kebabCase } from 'jsr:@mesqueeb/case-anything'

const logID = '🔵'
const maxLength = 50
const iconSelector = '[aria-label="Copy branch name"]'
const issueID = location?.href.split('/')[5]
const branchTemplate = ({ type, title }: { type: string; title: string }) =>
  `${type}-${issueID}-${title}`

console.log(`${logID} Init "Copy branch name"`)

function waitForElm(selector: string) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        resolve(document.querySelector(selector))
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}

function copyTemplate({ type, title }: Parameters<typeof branchTemplate>[0]) {
  let branch = branchTemplate({ type, title })

  if (branch.length > maxLength) {
    branch = branch.slice(0, maxLength)
  }

  return `git checkout -b ${branch}`
}

async function main() {
  await waitForElm(iconSelector)

  const button = document.querySelector(iconSelector)?.parentElement
  const type = 'feat'
  const title = (
    document.querySelector('[data-view-id="issue-view"] div div') as HTMLElement
  )?.innerText

  button?.addEventListener('click', e => {
    e.stopPropagation()
    const checkout = copyTemplate({ type, title: kebabCase(title) })
    navigator.clipboard.writeText(checkout)

    console.log(`Copied "${checkout}" to clipboard`)
  })
}

main()
