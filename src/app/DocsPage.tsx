import { GetServerSideProps } from 'next'
import fs from 'fs'
import path from 'path'
 import remarkHtml from 'remark-html'
import { remark } from 'remark'

interface DocsPageProps {
  content: string
}

const DocsPage = ({ content }: DocsPageProps) => {
  return (
    <div>
      <h1>Documentation</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const filePath = path.join(process.cwd(), 'public/md', 'docs.md')
  const fileContent = fs.readFileSync(filePath, 'utf-8')

  const processedContent = await remark()
    .use(remarkHtml)
    .process(fileContent)

  return {
    props: {
      content: processedContent.toString(),
    },
  }
}

export default DocsPage
