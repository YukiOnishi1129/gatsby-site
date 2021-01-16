/**
 * gatsby-node.js
 * Gatsbyがページ生成する際に、特定のタイミングやイベントを合わせて実行したい時に処理を設定する
 */

const path = require("path")

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const blogresult = await graphql(`
    query {
      allContentfulBlogPost(sort: { fields: publishDate, order: DESC }) {
        edges {
          node {
            id
            slug
          }
        }
      }
    }
  `)

  if (blogresult.errors) {
    reporter.panicOnBuild(`GraphQLのエラーが発生しました。`)
    return
  }

  blogresult.data.allContentfulBlogPost.edges.forEach(({ node }) => {
    createPage({
      path: `/blog/post/${node.slug}`,
      component: path.resolve(`./src/templates/blogpost-template.js`),
      context: {
        id: node.id,
      },
    })
  })
}
