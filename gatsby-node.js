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
          next {
            title
            slug
          }
          previous {
            title
            slug
          }
        }
      }
      allContentfulCategory {
        edges {
          node {
            category
            categorySlug
            id
          }
        }
      }
    }
  `)

  if (blogresult.errors) {
    reporter.panicOnBuild(`GraphQLのエラーが発生しました。`)
    return
  }

  blogresult.data.allContentfulBlogPost.edges.forEach(
    ({ node, next, previous }) => {
      createPage({
        path: `/blog/post/${node.slug}/`,
        component: path.resolve(`./src/templates/blogpost-template.js`),
        context: {
          id: node.id,
          next,
          previous,
        },
      })
    }
  )

  const blogPostsPerPage = 6 // 1ページに表示する記事の数
  const blogPosts = blogresult.data.allContentfulBlogPost.edges.length // 記事の数
  const blogPages = Math.ceil(blogPosts / blogPostsPerPage) // 記事一覧ページの総数

  Array.from({ length: blogPages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? `/blog/` : `/blog/${i + 1}`,
      component: path.resolve("./src/templates/blog-template.js"),
      context: {
        skip: blogPostsPerPage * i,
        limit: blogPostsPerPage,
        currentPage: i + 1, // 現在のページ番号,
        isFirst: i + 1 === 1, // 最初のページ
        isLast: i + 1 === blogPages, // 最後のページ
      },
    })
  })

  blogresult.data.allContentfulCategory.edges.forEach(({ node }) => {
    createPage({
      path: `/cat/${node.categorySlug}/`,
      component: path.resolve(`./src/templates/cat-template.js`),
      context: {
        catid: node.id,
        catname: node.category,
        skip: 0,
        limit: 100,
        currentPage: 1,
        isFirst: true,
        isLast: true,
      },
    })
  })
}
