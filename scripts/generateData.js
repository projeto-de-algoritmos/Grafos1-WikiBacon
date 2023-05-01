const fs = require('fs')

const MAX_PAGES = parseInt(process.argv[2]) || 1000

async function doFetch(page) {
  const response = await fetch(
    'https://pt.wikipedia.org/w/rest.php/v1/page/' + page + '/html',
    {
      'Api-User-Agent':
        'MediaWiki REST API docs examples/0.1 (https://www.mediawiki.org/wiki/API_talk:REST_API)',
    }
  )
  const data = await response.text()
  return data
}

async function fetchAsync(page) {
  try {
    return await doFetch(page)
  } catch (err) {
    console.error(err.message)
  }
}

function isValidLink(link) {
  const tokens = ['File:', '#', 'Category:', 'Help:']

  for (const token of tokens) {
    if (link.indexOf(token) > -1) return false
  }
  return true
}

function getPageName(link) {
  const toFind = '/page/'
  const index = link.indexOf(toFind) + toFind.length
  return link.substring(index)
}

async function parseLinks(page) {
  let outputHtml = await fetchAsync(page)
  let links = []
  let pageNameSet = new Set()

  if (outputHtml) {
    let linkStartPos = 0
    let linkEndPos = 0
    let find = 'href="./'
    while (outputHtml.indexOf(find, linkStartPos) > -1) {
      linkStartPos = outputHtml.indexOf(find, linkStartPos) + find.length
      linkEndPos = outputHtml.indexOf('"', linkStartPos + 1)
      let link = outputHtml.substring(linkStartPos, linkEndPos)

      if (isValidLink(link)) {
        links.push('https://pt.wikipedia.org/w/rest.php/v1/page/' + link)
        pageNameSet.add(
          getPageName(`https://pt.wikipedia.org/w/rest.php/v1/page/${link}`)
        )
      }
      linkStartPos = linkEndPos + 1
    }
  }
  return pageNameSet
}

function getCurrentDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')
  const formattedDate = `${year}-${month}-${day}`
  return formattedDate
}

function compressNumber(number) {
  if (number >= 1000) {
    return `${(number / 1000).toFixed(0)}k`
  } else {
    return number
  }
}

// START
const startPage = 'Wikipédia'
async function startFetching() {
  const queue = []
  const wikiPagesMap = new Map()
  let count = 0
  queue.push(startPage)
  wikiPagesMap.set(startPage, {
    title: startPage,
    links: [],
  })
  console.log(MAX_PAGES)
  while (queue.length > 0) {
    let currPage = queue.shift()
    console.log(`[${++count}] Fetching: ${currPage}`)
    let linkedPages = await parseLinks(currPage)
    if (wikiPagesMap.size >= MAX_PAGES) continue

    linkedPages.forEach((linkedPage) => {
      wikiPagesMap.get(currPage).links.push(linkedPage)
      if (!wikiPagesMap.has(linkedPage) && wikiPagesMap.size < MAX_PAGES) {
        queue.push(linkedPage)
        wikiPagesMap.set(linkedPage, {
          title: linkedPage,
          links: [],
        })
      }
    })
  }

  const date = getCurrentDate()
  const nodesCount = compressNumber(wikiPagesMap.size)
  fs.writeFile(
    `../data/data-${nodesCount}-${date}.json`,
    JSON.stringify(Object.fromEntries(wikiPagesMap), null, 2),
    function (err) {
      if (err) {
        console.log(err)
      }
    }
  )
}

startFetching()
