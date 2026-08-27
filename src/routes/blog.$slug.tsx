import { createFileRoute, notFound } from "@tanstack/react-router";
import { getBlogPostBySlug, getPublicBlogData } from "@/lib/blog.functions";
import { BlogDetailPage } from "@/pages/blog-detail/BlogDetailPage";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const [post, publicPayload] = await Promise.all([
      getBlogPostBySlug({ data: { slug: params.slug } }),
      getPublicBlogData(),
    ]);

    if (!post) {
      throw notFound();
    }

    const related = publicPayload.posts.filter((p) => p.slug !== post.slug);

    return {
      post,
      relatedPosts: related,
    };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: [{ title: "Article Not Found — DIMISI Blog" }],
      };
    }

    return {
      meta: [
        { title: `${post.title} — DIMISI Blog` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:image", content: post.cover_image },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.excerpt },
        { name: "twitter:image", content: post.cover_image },
      ],
    };
  },
  component: BlogDetailRouteComponent,
});

function BlogDetailRouteComponent() {
  const { post, relatedPosts } = Route.useLoaderData();
  return <BlogDetailPage post={post} relatedPosts={relatedPosts} />;
}
